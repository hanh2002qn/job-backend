import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobCrawlerStrategy } from './interfaces/job-crawler.interface';
import { TopCvCrawler } from './strategies/topcv.crawler';
import { LinkedInCrawler } from './strategies/linkedin.crawler';

@Injectable()
export class JobCrawlerService {
  private readonly logger = new Logger(JobCrawlerService.name);
  private readonly strategies: JobCrawlerStrategy[];

  constructor(
    private readonly topCvCrawler: TopCvCrawler,
    private readonly linkedInCrawler: LinkedInCrawler,
  ) {
    this.strategies = [this.topCvCrawler, this.linkedInCrawler];
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Starting job crawl...');

    for (const strategy of this.strategies) {
      try {
        this.logger.log(`Executing strategy: ${strategy.name}`);
        await strategy.crawl();
      } catch (error) {
        this.logger.error(`Error executing strategy ${strategy.name}`, error);
      }
    }

    this.logger.log('Job crawl finished.');
  }
  async crawlSpecificUrl(url: string) {
    if (url.includes('topcv')) {
      await this.topCvCrawler.crawlSpecificUrl(url); // We need to expose this in TopCvCrawler
    }
  }
}
