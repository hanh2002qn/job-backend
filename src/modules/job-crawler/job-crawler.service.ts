import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JobCrawlerStrategy, CrawlResult } from './interfaces/job-crawler.interface';
import { TopCvCrawler } from './strategies/topcv.crawler';
import { LinkedInCrawler } from './strategies/linkedin.crawler';
import { CrawlerStats, CrawlerStatus } from './entities/crawler-stats.entity';
import { CrawlerConfig } from './entities/crawler-config.entity';
import { RateLimiterService } from './services/rate-limiter.service';
import { UpdateCrawlerConfigDto } from './dto/update-crawler-config.dto';

@Injectable()
export class JobCrawlerService {
  private readonly logger = new Logger(JobCrawlerService.name);
  private readonly strategies: JobCrawlerStrategy[];

  constructor(
    private readonly topCvCrawler: TopCvCrawler,
    private readonly linkedInCrawler: LinkedInCrawler,
    @InjectRepository(CrawlerStats)
    private readonly statsRepository: Repository<CrawlerStats>,
    @InjectRepository(CrawlerConfig)
    private readonly configRepository: Repository<CrawlerConfig>,
    private readonly rateLimiter: RateLimiterService,
  ) {
    this.strategies = [this.topCvCrawler, this.linkedInCrawler];
  }

  /**
   * Run job crawl - called by worker scheduler
   */
  async handleCron() {
    this.logger.log('Starting job crawl...');

    // Sync sources before running
    await this.syncConfigs();
    const activeConfigs = await this.configRepository.find({ where: { isActive: true } });
    const activeSources = activeConfigs.map((c) => c.source);

    for (const strategy of this.strategies) {
      if (
        !activeSources.includes(strategy.name.toLowerCase()) &&
        !activeSources.includes(strategy.name)
      ) {
        this.logger.log(`Skipping inactive strategy: ${strategy.name}`);
        continue;
      }

      const startTime = Date.now();
      let status: CrawlerStatus = 'success';
      let errorMessage: string | null = null;
      let result: CrawlResult = {
        jobsFound: 0,
        jobsCreated: 0,
        jobsUpdated: 0,
        jobsSkipped: 0,
        duplicatesSkipped: 0,
        errors: 0,
      };

      try {
        this.logger.log(`Executing strategy: ${strategy.name}`);
        result = await strategy.crawl();

        if (result.errors > 0 && result.jobsCreated > 0) {
          status = 'partial';
        }
      } catch (error) {
        this.logger.error(`Error executing strategy ${strategy.name}`, error);
        status = 'failed';
        errorMessage = error instanceof Error ? error.message : String(error);
        result.errors++;
      }

      // Save stats
      const stats = this.statsRepository.create({
        source: strategy.name.toLowerCase(),
        jobsFound: result.jobsFound,
        jobsCreated: result.jobsCreated,
        jobsUpdated: result.jobsUpdated,
        jobsSkipped: result.jobsSkipped,
        duplicatesSkipped: result.duplicatesSkipped,
        errors: result.errors,
        durationMs: Date.now() - startTime,
        status,
        errorMessage,
      });

      await this.statsRepository.save(stats);
      this.logger.log(`Stats saved for ${strategy.name}: ${JSON.stringify(result)}`);
    }

    this.logger.log('Job crawl finished.');
  }

  async crawlSpecificUrl(url: string) {
    if (url.includes('topcv')) {
      await this.topCvCrawler.crawlSpecificUrl(url);
    }
  }

  /**
   * Sync configuration table with available strategies
   */
  async syncConfigs() {
    const existingConfigs = await this.configRepository.find();
    const strategyNames = this.strategies.map((s) => s.name);

    for (const name of strategyNames) {
      if (!existingConfigs.some((c) => c.source === name)) {
        const config = this.configRepository.create({
          source: name,
          isActive: true, // Default to true
        });
        await this.configRepository.save(config);
      }
    }
  }

  /**
   * Get all crawler configs
   */
  async getConfigs() {
    await this.syncConfigs();
    return this.configRepository.find({ order: { source: 'ASC' } });
  }

  /**
   * Update crawler config
   */
  async updateConfig(source: string, updateDto: UpdateCrawlerConfigDto) {
    const config = await this.configRepository.findOne({ where: { source } });
    if (!config) {
      throw new Error(`Crawler config not found for source: ${source}`);
    }

    if (updateDto.isActive !== undefined) {
      config.isActive = updateDto.isActive;
    }

    if (updateDto.config !== undefined) {
      config.config = updateDto.config;
    }

    return this.configRepository.save(config);
  }

  /**
   * Get crawler health stats
   */
  async getHealth() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    await this.syncConfigs();
    const configs = await this.getConfigs();

    const recentStats = await this.statsRepository.find({
      where: { runAt: MoreThan(oneDayAgo) },
      order: { runAt: 'DESC' },
      take: 20,
    });

    const sources = this.strategies.map((s) => s.name);
    const health: Record<
      string,
      {
        isActive: boolean;
        lastRun: Date | null;
        lastStatus: CrawlerStatus | null;
        totalJobsLast24h: number;
        errorsLast24h: number;
        avgDurationMs: number;
        rateLimitStatus: { currentDelay: number; consecutiveErrors: number };
      }
    > = {};

    for (const source of sources) {
      const sourceStats = recentStats.filter(
        (s) => s.source.toLowerCase() === source.toLowerCase(),
      );
      const lastStat = sourceStats[0] || null;
      const config = configs.find((c) => c.source === source);

      health[source] = {
        isActive: config?.isActive ?? true,
        lastRun: lastStat?.runAt || null,
        lastStatus: lastStat?.status || null,
        totalJobsLast24h: sourceStats.reduce((sum, s) => sum + s.jobsCreated, 0),
        errorsLast24h: sourceStats.reduce((sum, s) => sum + s.errors, 0),
        avgDurationMs:
          sourceStats.length > 0
            ? Math.round(sourceStats.reduce((sum, s) => sum + s.durationMs, 0) / sourceStats.length)
            : 0,
        rateLimitStatus: this.rateLimiter.getStatus(source),
      };
    }

    return {
      status: this.calculateOverallStatus(health),
      sources: health,
      recentRuns: recentStats.slice(0, 5),
    };
  }

  private calculateOverallStatus(
    health: Record<string, { lastStatus: CrawlerStatus | null; errorsLast24h: number }>,
  ): 'healthy' | 'degraded' | 'unhealthy' {
    const statuses = Object.values(health).map((h) => h.lastStatus);
    const totalErrors = Object.values(health).reduce((sum, h) => sum + h.errorsLast24h, 0);

    if (statuses.some((s) => s === 'failed')) return 'unhealthy';
    if (statuses.some((s) => s === 'partial') || totalErrors > 10) return 'degraded';
    return 'healthy';
  }
}
