import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES, JOB_TYPES } from '../common/redis/queue.constants';
import { TopCvCrawler } from '../modules/job-crawler/strategies/topcv.crawler';
import { LinkedInCrawler } from '../modules/job-crawler/strategies/linkedin.crawler';
import { IndeedCrawler } from '../modules/job-crawler/strategies/indeed.crawler';
import { TimviecnhanhCrawler } from '../modules/job-crawler/strategies/timviecnhanh.crawler';
import { ItviecCrawler } from '../modules/job-crawler/strategies/itviec.crawler';
import { TopDevCrawler } from '../modules/job-crawler/strategies/topdev.crawler';
import { VietnamWorksCrawler } from '../modules/job-crawler/strategies/vietnamworks.crawler';
import { UpworkCrawler } from '../modules/job-crawler/strategies/upwork.crawler';
import { FreelancerCrawler } from '../modules/job-crawler/strategies/freelancer.crawler';
import { Vieclam24hCrawler } from '../modules/job-crawler/strategies/vieclam24h.crawler';
import { Job123Crawler } from '../modules/job-crawler/strategies/123job.crawler';
import { FacebookCrawler } from '../modules/job-crawler/strategies/facebook.crawler';

interface CrawlerJobData {
  platform:
    | 'topcv'
    | 'linkedin'
    | 'vietnamworks'
    | 'indeed'
    | 'timviecnhanh'
    | 'itviec'
    | 'topdev'
    | 'upwork'
    | 'freelancer'
    | 'vieclam24h'
    | '123job'
    | 'facebook';
  keywords?: string[];
  location?: string;
  maxPages?: number;
}

@Processor(QUEUES.CRAWLER)
export class CrawlerProcessor extends WorkerHost {
  private readonly logger = new Logger(CrawlerProcessor.name);

  constructor(
    private readonly topCvCrawler: TopCvCrawler,
    private readonly linkedInCrawler: LinkedInCrawler,
    private readonly indeedCrawler: IndeedCrawler,
    private readonly timviecnhanhCrawler: TimviecnhanhCrawler,
    private readonly itviecCrawler: ItviecCrawler,
    private readonly topDevCrawler: TopDevCrawler,
    private readonly vietnamWorksCrawler: VietnamWorksCrawler,
    private readonly upworkCrawler: UpworkCrawler,
    private readonly freelancerCrawler: FreelancerCrawler,
    private readonly vieclam24hCrawler: Vieclam24hCrawler,
    private readonly job123Crawler: Job123Crawler,
    private readonly facebookCrawler: FacebookCrawler,
  ) {
    super();
  }

  async process(job: Job<CrawlerJobData>): Promise<number> {
    this.logger.log(`Processing job ${job.id}: ${job.name}`);

    try {
      switch (job.name) {
        case JOB_TYPES.CRAWL_TOPCV: {
          await this.topCvCrawler.crawl();
          return 1;
        }

        case JOB_TYPES.CRAWL_LINKEDIN: {
          await this.linkedInCrawler.crawl();
          return 1;
        }

        case JOB_TYPES.CRAWL_VIETNAMWORKS: {
          await this.vietnamWorksCrawler.crawl();
          return 1;
        }

        case JOB_TYPES.CRAWL_INDEED: {
          await this.indeedCrawler.crawl();
          return 1;
        }

        case JOB_TYPES.CRAWL_TIMVIECNHANH: {
          await this.timviecnhanhCrawler.crawl();
          return 1;
        }

        case JOB_TYPES.CRAWL_ITVIEC: {
          await this.itviecCrawler.crawl();
          return 1;
        }

        case JOB_TYPES.CRAWL_TOPDEV: {
          await this.topDevCrawler.crawl();
          return 1;
        }

        case JOB_TYPES.CRAWL_UPWORK: {
          await this.upworkCrawler.crawl();
          return 1;
        }

        case JOB_TYPES.CRAWL_FREELANCER: {
          await this.freelancerCrawler.crawl();
          return 1;
        }

        case JOB_TYPES.CRAWL_VIECLAM24H: {
          await this.vieclam24hCrawler.crawl();
          return 1;
        }

        case JOB_TYPES.CRAWL_123JOB: {
          await this.job123Crawler.crawl();
          return 1;
        }

        case JOB_TYPES.CRAWL_FACEBOOK: {
          await this.facebookCrawler.crawl();
          return 1;
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
