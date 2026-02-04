import { Injectable, Logger } from '@nestjs/common';
import {
  JobCrawlerStrategy,
  NormalizedJobData,
  RawLinkedInJob,
  CrawlResult,
} from '../interfaces/job-crawler.interface';
import { JobsService } from '../../jobs/jobs.service';
import { JobNormalizationService } from '../services/job-normalization.service';
import { DeduplicationService } from '../services/deduplication.service';
import { RateLimiterService } from '../services/rate-limiter.service';

@Injectable()
export class LinkedInCrawler implements JobCrawlerStrategy {
  name = 'LinkedIn';
  private readonly logger = new Logger(LinkedInCrawler.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly normalizationService: JobNormalizationService,
    private readonly deduplicationService: DeduplicationService,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  async crawl(): Promise<CrawlResult> {
    this.logger.log('Crawling LinkedIn (Mock)...');

    const result: CrawlResult = {
      jobsFound: 0,
      jobsCreated: 0,
      jobsUpdated: 0,
      jobsSkipped: 0,
      duplicatesSkipped: 0,
      errors: 0,
    };

    // Mock Implementation
    const jobs = [
      {
        externalId: 'li-1',
        title: 'Senior NestJS Developer',
        company: 'Tech Corp',
        location: 'Ho Chi Minh',
        salaryRaw: '2000-3000 USD',
        description: 'We are looking for a NestJS expert...',
        source: 'linkedin',
        url: 'https://linkedin.com/jobs/view/1',
        postedAt: new Date(),
      },
    ];

    result.jobsFound = jobs.length;

    for (const raw of jobs) {
      try {
        await this.rateLimiter.throttle('linkedin');

        // Check for duplicates
        const dupeCheck = await this.deduplicationService.checkDuplicate(
          raw.title,
          raw.company,
          raw.location,
          raw.externalId,
        );

        if (dupeCheck.isDuplicate && dupeCheck.matchType !== 'external_id') {
          this.logger.log(`Duplicate found: ${raw.title} (${dupeCheck.matchType})`);
          result.duplicatesSkipped++;
          continue;
        }

        const normalized = this.normalizeJobData(raw);

        // Add content hash
        normalized.contentHash = this.deduplicationService.generateContentHash(
          raw.title,
          raw.company,
          raw.location,
        );

        const existing = await this.jobsService.findByExternalId(raw.externalId);
        if (existing) {
          await this.jobsService.update(existing.id, normalized);
          result.jobsUpdated++;
          this.logger.log(`Updated job: ${normalized.title}`);
        } else {
          await this.jobsService.create(normalized);
          result.jobsCreated++;
          this.logger.log(`Imported job: ${normalized.title}`);
        }

        this.rateLimiter.recordSuccess('linkedin');
      } catch (error) {
        this.rateLimiter.recordError('linkedin');
        result.errors++;
        this.logger.error(`Error processing job: ${raw.title}`, error);
      }
    }

    return result;
  }

  private normalizeJobData(raw: RawLinkedInJob): NormalizedJobData & { contentHash?: string } {
    const salaryParsed = this.normalizationService.parseSalary(raw.salaryRaw);

    return {
      externalId: raw.externalId,
      title: raw.title,
      company: raw.company,
      location: raw.location,
      salaryMin: salaryParsed.min,
      salaryMax: salaryParsed.max,
      currency: salaryParsed.currency,
      salary: raw.salaryRaw || '',
      description: this.normalizationService.sanitizeHtml(raw.description),
      jobType: this.normalizationService.normalizeJobType('Full-time'),
      experienceLevel: this.normalizationService.normalizeExperienceLevel(raw.title),
      source: raw.source,
      url: raw.url,
      skills: ['Mock Skill'],
    };
  }
}
