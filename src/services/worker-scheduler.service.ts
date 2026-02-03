import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QUEUES, JOB_TYPES } from '../common/redis/queue.constants';

// Import services that have scheduled tasks
import { JobCrawlerService } from '../modules/job-crawler/job-crawler.service';
import { JobAlertService } from '../modules/job-alert/job-alert.service';
import { TrackerService } from '../modules/tracker/tracker.service';

@Injectable()
export class WorkerSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(WorkerSchedulerService.name);

  constructor(
    @InjectQueue(QUEUES.CRAWLER)
    private readonly crawlerQueue: Queue,

    @InjectQueue(QUEUES.EMAIL)
    private readonly emailQueue: Queue,

    // Inject services for cron jobs
    private readonly jobCrawlerService: JobCrawlerService,
    private readonly jobAlertService: JobAlertService,
    private readonly trackerService: TrackerService,
  ) {}

  async onModuleInit() {
    this.logger.log('Worker Scheduler Service initialized');

    this.logger.log('Scheduled jobs:');
    this.logger.log('  - Job Crawler: EVERY_HOUR');
    this.logger.log('  - Job Alerts: EVERY_HOUR');
    this.logger.log('  - Tracker Reminders: EVERY_DAY_AT_9AM');
  }

  // ============================================================
  // SCHEDULED CRON JOBS - These run only in the worker process
  // ============================================================

  /**
   * Crawl jobs from external sources every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleJobCrawl() {
    this.logger.log('[CRON] Starting hourly job crawl...');
    try {
      await this.jobCrawlerService.handleCron();
      this.logger.log('[CRON] Job crawl completed');
    } catch (error) {
      this.logger.error('[CRON] Job crawl failed:', error);
    }
  }

  /**
   * Check and send job alerts every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleJobAlerts() {
    this.logger.log('[CRON] Starting hourly job alerts check...');
    try {
      await this.jobAlertService.handleJobAlerts();
      this.logger.log('[CRON] Job alerts completed');
    } catch (error) {
      this.logger.error('[CRON] Job alerts failed:', error);
    }
  }

  /**
   * Send tracker reminders daily at 9 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleTrackerReminders() {
    this.logger.log('[CRON] Starting daily tracker reminders...');
    try {
      await this.trackerService.handleReminders();
      this.logger.log('[CRON] Tracker reminders completed');
    } catch (error) {
      this.logger.error('[CRON] Tracker reminders failed:', error);
    }
  }

  // ============================================================
  // QUEUE HELPERS - For adding jobs to queues from API
  // ============================================================

  /**
   * Manually trigger a crawl job via queue
   */
  async triggerCrawlQueue(platform: 'topcv' | 'linkedin' | 'vietnamworks' = 'topcv') {
    const jobType =
      platform === 'topcv'
        ? JOB_TYPES.CRAWL_TOPCV
        : platform === 'linkedin'
          ? JOB_TYPES.CRAWL_LINKEDIN
          : JOB_TYPES.CRAWL_VIETNAMWORKS;

    await this.crawlerQueue.add(
      jobType,
      { platform },
      {
        priority: 1,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );

    this.logger.log(`Queued ${platform} crawl job`);
  }
}
