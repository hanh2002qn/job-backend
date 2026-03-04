import { Injectable, Logger } from '@nestjs/common';
import {
  JobCrawlerStrategy,
  NormalizedJobData,
  CrawlResult,
} from '../interfaces/job-crawler.interface';
import { JobsService } from '../../jobs/jobs.service';
import { JobNormalizationService } from '../services/job-normalization.service';
import { DeduplicationService } from '../services/deduplication.service';
import { RateLimiterService } from '../services/rate-limiter.service';

@Injectable()
export class Vieclam24hCrawler implements JobCrawlerStrategy {
  name = 'Vieclam24h';
  private readonly logger = new Logger(Vieclam24hCrawler.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly normalizationService: JobNormalizationService,
    private readonly deduplicationService: DeduplicationService,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  async crawl(): Promise<CrawlResult> {
    this.logger.log(`Crawling ${this.name} (Mock)...`);
    const result: CrawlResult = {
      jobsFound: 0,
      jobsCreated: 0,
      jobsUpdated: 0,
      jobsSkipped: 0,
      duplicatesSkipped: 0,
      errors: 0,
    };
    return result;
  }
}
