import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES, JOB_TYPES } from '../common/redis/queue.constants';
import { MailService } from '../modules/mail/mail.service';

interface EmailJobData {
  type: string;
  to: string;
  userId: string;
  subject?: string;
  data?: Record<string, unknown>;
}

interface ReminderEmailData extends EmailJobData {
  jobTitle: string;
  company: string;
  nextActionDate: Date;
}

interface JobAlertEmailData extends EmailJobData {
  matchingJobs: Array<{
    title: string;
    company: string;
    url: string;
    matchScore: number;
  }>;
}

@Processor(QUEUES.EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<boolean> {
    this.logger.log(`Processing email job ${job.id}: ${job.name}`);

    try {
      switch (job.name) {
        case JOB_TYPES.SEND_REMINDER: {
          const data = job.data as ReminderEmailData;
          await this.mailService.sendReminderEmail(
            data.userId,
            data.to,
            data.jobTitle,
            data.company,
            new Date(data.nextActionDate),
          );
          return true;
        }

        case JOB_TYPES.SEND_JOB_ALERT: {
          const data = job.data as JobAlertEmailData;
          // TODO: Implement job alert email
          this.logger.log(
            `Sending job alert to ${data.to} with ${data.matchingJobs?.length || 0} jobs`,
          );
          return true;
        }

        case JOB_TYPES.SEND_WELCOME: {
          // TODO: Implement welcome email
          this.logger.log(`Sending welcome email to ${job.data.to}`);
          return true;
        }

        default:
          this.logger.warn(`Unknown email job type: ${job.name}`);
          return false;
      }
    } catch (error) {
      this.logger.error(`Email job failed: ${error}`);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Email job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Email job ${job.id} failed: ${error.message}`);
  }
}
