import { Injectable, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobTracker, ApplicationStatus } from './entities/job-tracker.entity';
import { CreateTrackerDto } from './dto/create-tracker.dto';
import { UpdateTrackerDto } from './dto/update-tracker.dto';
import { MailService } from '../mail/mail.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { GeminiService } from '../ai/gemini.service';
import { JobsService } from '../jobs/jobs.service';
import { InterviewSchedule } from './entities/interview-schedule.entity';
import { CreateInterviewDto } from './dto/create-interview.dto';

@Injectable()
export class TrackerService {
  private readonly logger = new Logger(TrackerService.name);

  constructor(
    @InjectRepository(JobTracker)
    private trackerRepository: Repository<JobTracker>,
    @InjectRepository(InterviewSchedule)
    private interviewRepository: Repository<InterviewSchedule>,
    private mailService: MailService,
    private subscriptionService: SubscriptionService,
    private geminiService: GeminiService,
    private jobsService: JobsService,
  ) {}

  /**
   * Add an interview schedule to a tracker entry
   */
  async addInterview(userId: string, trackerId: string, dto: CreateInterviewDto) {
    const tracker = await this.trackerRepository.findOne({
      where: { id: trackerId, userId },
      relations: ['job'],
    });

    if (!tracker) throw new NotFoundException('Tracker entry not found');

    const interview = this.interviewRepository.create({
      trackerId,
      ...dto,
    });

    const savedInterview = await this.interviewRepository.save(interview);

    // Update tracker status to INTERVIEW if not already
    if (tracker.status !== ApplicationStatus.INTERVIEW) {
      await this.trackerRepository.update(trackerId, {
        status: ApplicationStatus.INTERVIEW,
      });
    }

    return savedInterview;
  }

  /**
   * Get AI-generated preparation tips for an interview
   */
  async getInterviewPrepTips(userId: string, interviewId: string) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
      relations: ['tracker', 'tracker.job'],
    });

    if (!interview || interview.tracker.userId !== userId) {
      throw new NotFoundException('Interview not found');
    }

    // If tips already exist, return them
    if (interview.prepTips) return interview.prepTips;

    const job = interview.tracker.job;
    const jobDescription = job ? job.description : interview.tracker.notes;

    const prompt = `
      You are an expert recruitment coach.
      Task: Provide preparation tips for an upcoming interview.
      
      Interview Round: ${interview.roundName}
      Type: ${interview.type}
      Job Title: ${job?.title || interview.tracker.manualTitle}
      Job Description: ${jobDescription}
      
      Return a structured JSON:
      {
        "overview": "Brief overview of what to expect",
        "keyTopics": ["topic 1", "topic 2"],
        "sampleQuestions": ["question 1", "question 2"],
        "recommendedPreparation": ["tip 1", "tip 2"],
        "advice": "General professional advice"
      }
    `;

    const prepTips = await this.geminiService.generateJson<Record<string, unknown>>(prompt);

    interview.prepTips = prepTips;
    await this.interviewRepository.save(interview);

    return prepTips;
  }

  /**
   * Get all interviews for a user (Calendar view)
   */
  async findAllInterviews(userId: string) {
    return this.interviewRepository.find({
      where: { tracker: { userId } },
      relations: ['tracker', 'tracker.job'],
      order: { scheduledAt: 'ASC' },
    });
  }

  /**
   * Handle reminders - called by worker scheduler
   */
  async handleReminders() {
    this.logger.log('Checking for job trackers reminders...');
    const dueItems = await this.checkReminders();

    for (const item of dueItems) {
      if (item.user?.email) {
        const title = item.job?.title || item.manualTitle;
        const company = item.job?.company || item.manualCompany;

        if (title && company) {
          await this.mailService.sendReminderEmail(
            item.user.email,
            title,
            company,
            item.nextActionDate,
          );

          // Mark as sent
          await this.trackerRepository.update(item.id, {
            isReminderSent: true,
          });
        }
      }
    }
    this.logger.log(`Sent ${dueItems.length} reminder emails.`);
  }

  async create(userId: string, createTrackerDto: CreateTrackerDto) {
    // Freemium Check
    const isPremium = await this.subscriptionService.isPremium(userId);
    if (!isPremium) {
      const trackerCount = await this.trackerRepository.count({
        where: { userId },
      });
      if (trackerCount >= 5) {
        throw new ForbiddenException(
          'Free users are limited to tracking 5 jobs. Please upgrade to Premium for unlimited tracking.',
        );
      }
    }
    const tracker = this.trackerRepository.create({
      userId,
      ...createTrackerDto,
    });
    return this.trackerRepository.save(tracker);
  }

  async findAll(
    userId: string,
    filters?: {
      status?: ApplicationStatus;
      company?: string;
      title?: string;
      sortBy?: string;
      order?: 'ASC' | 'DESC';
    },
  ) {
    const query = this.trackerRepository
      .createQueryBuilder('tracker')
      .leftJoinAndSelect('tracker.job', 'job')
      .where('tracker.userId = :userId', { userId });

    if (filters?.status) {
      query.andWhere('tracker.status = :status', { status: filters.status });
    }

    if (filters?.company) {
      query.andWhere('(job.company ILIKE :company OR tracker.manualCompany ILIKE :company)', {
        company: `%${filters.company}%`,
      });
    }

    if (filters?.title) {
      query.andWhere('(job.title ILIKE :title OR tracker.manualTitle ILIKE :title)', {
        title: `%${filters.title}%`,
      });
    }

    const sortBy = filters?.sortBy || 'updatedAt';
    const order = filters?.order || 'DESC';

    const sortMap: Record<string, string> = {
      updatedAt: 'tracker.updatedAt',
      createdAt: 'tracker.createdAt',
      deadline: 'job.deadline',
      title: 'job.title',
      company: 'job.company',
    };

    query.orderBy(sortMap[sortBy] || 'tracker.updatedAt', order);

    return query.getMany();
  }

  async update(id: string, userId: string, updateDto: UpdateTrackerDto) {
    const tracker = await this.trackerRepository.findOne({
      where: { id, userId },
    });
    if (!tracker) {
      throw new NotFoundException('Tracker entry not found');
    }

    // If nextActionDate is being updated, reset isReminderSent
    if (
      updateDto.nextActionDate &&
      new Date(updateDto.nextActionDate).getTime() !== tracker.nextActionDate?.getTime()
    ) {
      tracker.isReminderSent = false;
    }

    Object.assign(tracker, updateDto);

    if (updateDto.status === ApplicationStatus.APPLIED && !tracker.appliedAt) {
      tracker.appliedAt = new Date();
    }

    return this.trackerRepository.save(tracker);
  }
  async remove(id: string, userId: string) {
    const tracker = await this.trackerRepository.findOne({
      where: { id, userId },
    });
    if (!tracker) {
      throw new NotFoundException('Tracker entry not found');
    }
    return this.trackerRepository.remove(tracker);
  }

  async getStats(userId: string) {
    const stats = await this.trackerRepository
      .createQueryBuilder('tracker')
      .select('tracker.status', 'status')
      .addSelect('COUNT(tracker.id)', 'count')
      .where('tracker.userId = :userId', { userId })
      .groupBy('tracker.status')
      .getRawMany<{ status: ApplicationStatus; count: string }>();

    // Convert to clearer object format
    const result: Record<string, number> = {
      total: 0,
      saved: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };

    stats.forEach((item) => {
      const count = parseInt(item.count, 10);
      result[item.status] = count;
      result.total += count;
    });

    return result;
  }

  // Cron job can call this
  async checkReminders() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find trackers with nextActionDate between now and tomorrow (24h window)
    // And isReminderSent is false
    const dueTrackers = await this.trackerRepository
      .createQueryBuilder('tracker')
      .leftJoinAndSelect('tracker.user', 'user')
      .leftJoinAndSelect('tracker.job', 'job')
      .where('tracker.nextActionDate BETWEEN :now AND :tomorrow', {
        now,
        tomorrow,
      })
      .andWhere('tracker.isReminderSent = :isSent', { isSent: false })
      .getMany();

    return dueTrackers;
  }
}
