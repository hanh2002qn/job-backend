import { Injectable, Logger } from '@nestjs/common';
import { Job } from '../jobs/entities/job.entity';
import { MailService } from '../mail/mail.service';
import { AlertChannel, AlertFrequency, JobAlert } from './entities/job-alert.entity';
import { UpdateJobAlertDto } from './dto/update-job-alert.dto';
import { MatchingService } from '../matching/matching.service';
import { JobsRepository } from '../jobs/jobs.repository';
import { ProfileRepository } from '../profiles/profile.repository';
import { JobAlertRepository } from './job-alert.repository';
import { UserJobNotificationRepository } from './user-job-notification.repository';

@Injectable()
export class JobAlertService {
  private readonly logger = new Logger(JobAlertService.name);

  constructor(
    private readonly jobsRepository: JobsRepository,
    private readonly profilesRepository: ProfileRepository,
    private readonly jobAlertRepository: JobAlertRepository,
    private readonly userJobNotificationRepository: UserJobNotificationRepository,
    private readonly mailService: MailService,
    private readonly matchingService: MatchingService,
  ) {}

  async createDefaultSettings(userId: string) {
    const existing = await this.jobAlertRepository.findOne({ where: { userId } });
    if (existing) return existing;

    const alert = this.jobAlertRepository.create({
      userId,
      isActive: true,
      frequency: AlertFrequency.DAILY,
      channels: [AlertChannel.EMAIL],
    });
    return this.jobAlertRepository.save(alert);
  }

  async getSettings(userId: string) {
    let settings = await this.jobAlertRepository.findOne({ where: { userId } });
    if (!settings) {
      settings = await this.createDefaultSettings(userId);
    }
    return settings;
  }

  async updateSettings(userId: string, dto: UpdateJobAlertDto) {
    let settings = await this.getSettings(userId);

    // Merge updates
    settings = this.jobAlertRepository.merge(settings, dto);
    return this.jobAlertRepository.save(settings);
  }

  /**
   * Check and send job alerts - called by worker scheduler
   */
  async handleJobAlerts() {
    this.logger.log('Starting enhanced job alert cycle...');

    // 1. Get all active users with alerts
    const activeAlerts = await this.jobAlertRepository.find({
      where: { isActive: true },
      relations: ['user', 'user.profile'],
    });

    if (activeAlerts.length === 0) {
      this.logger.log('No active job alerts found.');
      return;
    }

    // 2. Get recent jobs (limit to last 7 days for performance if needed, or all new)
    const recentJobs = await this.jobsRepository.find({
      where: { expired: false },
      order: { createdAt: 'DESC' },
      take: 100, // Process in chunks of 100 recent jobs per cycle
    });

    if (recentJobs.length === 0) {
      this.logger.log('No jobs found to alert.');
      return;
    }

    let processedUsers = 0;

    for (const alert of activeAlerts) {
      const user = alert.user;
      const profile = user?.profile;

      if (!user || !profile) continue;

      // Check Frequency
      if (!this.shouldSendAlert(alert)) continue;

      // 3. Find jobs this user hasn't been notified about yet
      const alreadyNotifiedJobIds = await this.userJobNotificationRepository
        .find({
          where: { userId: alert.userId },
          select: ['jobId'],
        })
        .then((list) => list.map((n) => n.jobId));

      const candidateJobs = recentJobs.filter((job) => !alreadyNotifiedJobIds.includes(job.id));

      if (candidateJobs.length === 0) continue;

      // 4. Use MatchingService for high-quality matches
      const matchedJobs: Job[] = [];
      const userSkills = profile.skills?.map((s) => s.toLowerCase().trim()) || [];

      for (const job of candidateJobs) {
        // We use the internal synchronous calculation for speed in the loop
        // If we want FULL AI, we would call getSemanticMatch, but that's expensive per job/user
        // So we use rule-based for the alert "filter"
        const matchResult = this.matchingService.calculateMatch(job, profile, userSkills);

        if (matchResult.matchScore >= 40) {
          // Threshold for alerts
          matchedJobs.push(job);
        }
      }

      if (matchedJobs.length > 0) {
        // 5. Send alerts
        await this.sendAlerts(alert, user.email, matchedJobs);

        // 6. Record notifications to avoid duplicates
        const notifications = matchedJobs.map((job) =>
          this.userJobNotificationRepository.create({
            userId: alert.userId,
            jobId: job.id,
            sentAt: new Date(),
          }),
        );
        await this.userJobNotificationRepository.save(notifications);

        // Update lastSentAt
        await this.jobAlertRepository.update(alert.id, { lastSentAt: new Date() });
        processedUsers++;
      }
    }

    this.logger.log(`Job alert cycle complete. Notified ${processedUsers} users.`);
  }

  private shouldSendAlert(alert: JobAlert): boolean {
    if (!alert.lastSentAt) return true;

    const now = new Date();
    const last = new Date(alert.lastSentAt);
    const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);

    if (alert.frequency === AlertFrequency.DAILY) {
      return diffHours >= 23; // Small buffer
    } else if (alert.frequency === AlertFrequency.WEEKLY) {
      return diffHours >= 24 * 7 - 1;
    }
    return true;
  }

  private async sendAlerts(alert: JobAlert, email: string, jobs: Job[]) {
    // 1. Email Channel
    if (alert.channels.includes(AlertChannel.EMAIL)) {
      try {
        const mappedJobs = jobs.map((j) => ({
          title: j.title,
          company: j.company,
          location: j.location,
          salary: j.salary,
          url: j.url || `${process.env.FRONTEND_URL}/jobs/${j.id}`,
        }));
        await this.mailService.sendJobAlertEmail(alert.userId, email, mappedJobs);
        this.logger.log(`Sent email alert to ${email}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`Failed to send email to ${email}: ${message}`);
      }
    }
  }
}
