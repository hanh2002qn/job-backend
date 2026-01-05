import { Injectable, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobTracker, ApplicationStatus } from './entities/job-tracker.entity';
import { CreateTrackerDto } from './dto/create-tracker.dto';
import { UpdateTrackerDto } from './dto/update-tracker.dto';
import { MailService } from '../mail/mail.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class TrackerService {
    private readonly logger = new Logger(TrackerService.name);

    constructor(
        @InjectRepository(JobTracker)
        private trackerRepository: Repository<JobTracker>,
        private mailService: MailService,
        private subscriptionService: SubscriptionService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_9AM)
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
                        item.nextActionDate
                    );

                    // Mark as sent
                    await this.trackerRepository.update(item.id, { isReminderSent: true });
                }
            }
        }
        this.logger.log(`Sent ${dueItems.length} reminder emails.`);
    }

    async create(userId: string, createTrackerDto: CreateTrackerDto) {
        // Freemium Check
        const isPremium = await this.subscriptionService.isPremium(userId);
        if (!isPremium) {
            const trackerCount = await this.trackerRepository.count({ where: { userId } });
            if (trackerCount >= 5) {
                throw new ForbiddenException('Free users are limited to tracking 5 jobs. Please upgrade to Premium for unlimited tracking.');
            }
        }
        const tracker = this.trackerRepository.create({
            userId,
            ...createTrackerDto,
        });
        return this.trackerRepository.save(tracker);
    }

    async findAll(userId: string, filters?: { status?: ApplicationStatus, company?: string, title?: string, sortBy?: string, order?: 'ASC' | 'DESC' }) {
        const query = this.trackerRepository.createQueryBuilder('tracker')
            .leftJoinAndSelect('tracker.job', 'job')
            .where('tracker.userId = :userId', { userId });

        if (filters?.status) {
            query.andWhere('tracker.status = :status', { status: filters.status });
        }

        if (filters?.company) {
            query.andWhere('(job.company ILIKE :company OR tracker.manualCompany ILIKE :company)', { company: `%${filters.company}%` });
        }

        if (filters?.title) {
            query.andWhere('(job.title ILIKE :title OR tracker.manualTitle ILIKE :title)', { title: `%${filters.title}%` });
        }

        const sortBy = filters?.sortBy || 'updatedAt';
        const order = filters?.order || 'DESC';

        const sortMap = {
            updatedAt: 'tracker.updatedAt',
            createdAt: 'tracker.createdAt',
            deadline: 'job.deadline',
            title: 'job.title',
            company: 'job.company'
        };

        query.orderBy(sortMap[sortBy] || 'tracker.updatedAt', order);

        return query.getMany();
    }

    async update(id: string, userId: string, updateDto: UpdateTrackerDto) {
        const tracker = await this.trackerRepository.findOne({ where: { id, userId } });
        if (!tracker) {
            throw new NotFoundException('Tracker entry not found');
        }

        // If nextActionDate is being updated, reset isReminderSent
        if (updateDto.nextActionDate && new Date(updateDto.nextActionDate).getTime() !== tracker.nextActionDate?.getTime()) {
            tracker.isReminderSent = false;
        }

        Object.assign(tracker, updateDto);

        if (updateDto.status === ApplicationStatus.APPLIED && !tracker.appliedAt) {
            tracker.appliedAt = new Date();
        }

        return this.trackerRepository.save(tracker);
    }
    async remove(id: string, userId: string) {
        const tracker = await this.trackerRepository.findOne({ where: { id, userId } });
        if (!tracker) {
            throw new NotFoundException('Tracker entry not found');
        }
        return this.trackerRepository.remove(tracker);
    }

    async getStats(userId: string) {
        const stats = await this.trackerRepository.createQueryBuilder('tracker')
            .select('tracker.status', 'status')
            .addSelect('COUNT(tracker.id)', 'count')
            .where('tracker.userId = :userId', { userId })
            .groupBy('tracker.status')
            .getRawMany();

        // Convert to clearer object format
        const result = {
            total: 0,
            saved: 0,
            applied: 0,
            interview: 0,
            offer: 0,
            rejected: 0,
        };

        stats.forEach(item => {
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
        const dueTrackers = await this.trackerRepository.createQueryBuilder('tracker')
            .leftJoinAndSelect('tracker.user', 'user')
            .leftJoinAndSelect('tracker.job', 'job')
            .where('tracker.nextActionDate BETWEEN :now AND :tomorrow', { now, tomorrow })
            .andWhere('tracker.isReminderSent = :isSent', { isSent: false })
            .getMany();

        return dueTrackers;
    }
}
