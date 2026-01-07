import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Job } from '../jobs/entities/job.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { MailService } from '../mail/mail.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class JobAlertService {
  private readonly logger = new Logger(JobAlertService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleJobAlerts() {
    this.logger.log('Checking for new jobs to send alerts...');

    // 1. Get new jobs that haven't been alerted
    const newJobs = await this.jobsRepository.find({
      where: { isAlertSent: false, expired: false },
    });

    if (newJobs.length === 0) {
      this.logger.log('No new jobs for alerts.');
      return;
    }

    // 2. Get all users with profiles (and their preferences)
    const profiles = await this.profilesRepository.find({
      relations: ['user'],
    });

    // 3. Map alerts per user
    const userAlerts = new Map<string, { email: string; jobs: Job[] }>();

    for (const profile of profiles) {
      if (!profile.user?.email || !profile.user?.isVerified) continue;

      const matchedJobs = newJobs.filter((job) => this.isMatch(job, profile));

      if (matchedJobs.length > 0) {
        userAlerts.set(profile.userId, {
          email: profile.user.email,
          jobs: matchedJobs,
        });
      }
    }

    // 4. Send emails
    for (const [userId, alert] of userAlerts.entries()) {
      try {
        await this.mailService.sendJobAlertEmail(alert.email, alert.jobs);
        this.logger.log(
          `Sent job alert to ${alert.email} with ${alert.jobs.length} jobs`,
        );
      } catch (error) {
        this.logger.error(`Failed to send job alert to ${alert.email}`, error);
      }
    }

    // 5. Mark jobs as notified
    const jobIds = newJobs.map((j) => j.id);
    await this.jobsRepository.update({ id: In(jobIds) }, { isAlertSent: true });

    this.logger.log(`Processed alerts for ${newJobs.length} jobs.`);
  }

  private isMatch(job: Job, profile: Profile): boolean {
    // Simple matching logic

    // Match Industry (Category) - if user has industries set
    if (profile.preferredIndustries && profile.preferredIndustries.length > 0) {
      if (job.category) {
        const match = profile.preferredIndustries.some((ind) =>
          job.category.toLowerCase().includes(ind.toLowerCase()),
        );
        if (!match) return false;
      } else {
        // If job has no category, skip this filter or let it pass?
        // For now, let's say if user has preferences, they ONLY want those industries.
        return false;
      }
    }

    // Match Location
    if (profile.preferredLocations && profile.preferredLocations.length > 0) {
      const locMatch = profile.preferredLocations.some((loc) =>
        job.location.toLowerCase().includes(loc.toLowerCase()),
      );
      if (!locMatch) return false;
    }

    // Match Job Type
    if (profile.preferredJobTypes && profile.preferredJobTypes.length > 0) {
      if (job.jobType) {
        const typeMatch = profile.preferredJobTypes.some((type) =>
          job.jobType.toLowerCase().includes(type.toLowerCase()),
        );
        if (!typeMatch) return false;
      }
    }

    // Match Salary
    if (profile.minSalaryExpectation && job.salaryMax) {
      if (job.salaryMax < profile.minSalaryExpectation) {
        return false;
      }
    }

    return true;
  }
}
