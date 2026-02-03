import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES, JOB_TYPES } from '../common/redis/queue.constants';
import { TopCvCrawler } from '../modules/job-crawler/strategies/topcv.crawler';

interface CrawlerJobData {
  platform: 'topcv' | 'linkedin' | 'vietnamworks';
  keywords?: string[];
  location?: string;
  maxPages?: number;
}

@Processor(QUEUES.CRAWLER)
export class CrawlerProcessor extends WorkerHost {
  private readonly logger = new Logger(CrawlerProcessor.name);

  constructor(private readonly topCvCrawler: TopCvCrawler) {
    super();
  }

  async process(job: Job<CrawlerJobData>): Promise<number> {
    this.logger.log(`Processing job ${job.id}: ${job.name}`);

    try {
      switch (job.name) {
        case JOB_TYPES.CRAWL_TOPCV: {
          // TopCV crawling
          await this.topCvCrawler.crawl();
          return 1;
        }

        case JOB_TYPES.CRAWL_LINKEDIN: {
          // LinkedIn crawling (mock for now)
          this.logger.log('LinkedIn crawl - not implemented yet');
          return 0;
        }

        case JOB_TYPES.CRAWL_VIETNAMWORKS: {
          // VietnamWorks crawling
          this.logger.log('VietnamWorks crawl - not implemented yet');
          return 0;
        }

        default:
          this.logger.warn(`Unknown job type: ${job.name}`);
          return 0;
      }
    } catch (error) {
      this.logger.error(`Crawler job failed: ${error}`);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed with result: ${job.returnvalue}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
