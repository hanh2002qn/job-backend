import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobTracker, ApplicationStatus } from './entities/job-tracker.entity';
import { CreateTrackerDto } from './dto/create-tracker.dto';
import { UpdateTrackerDto } from './dto/update-tracker.dto';

@Injectable()
export class TrackerService {
    constructor(
        @InjectRepository(JobTracker)
        private trackerRepository: Repository<JobTracker>,
    ) { }

    async create(userId: string, createTrackerDto: CreateTrackerDto) {
        const tracker = this.trackerRepository.create({
            userId,
            ...createTrackerDto,
        });
        return this.trackerRepository.save(tracker);
    }

    async findAll(userId: string, filters?: any) {
        const query = this.trackerRepository.createQueryBuilder('tracker')
            .leftJoinAndSelect('tracker.job', 'job')
            .where('tracker.userId = :userId', { userId });

        if (filters?.status) {
            query.andWhere('tracker.status = :status', { status: filters.status });
        }

        // Sorting can be enhanced
        query.orderBy('tracker.updatedAt', 'DESC');

        return query.getMany();
    }

    async update(id: string, userId: string, updateDto: UpdateTrackerDto) {
        const tracker = await this.trackerRepository.findOne({ where: { id, userId } });
        if (!tracker) {
            throw new NotFoundException('Tracker entry not found');
        }

        Object.assign(tracker, updateDto);

        if (updateDto.status === ApplicationStatus.APPLIED && !tracker.appliedAt) {
            tracker.appliedAt = new Date();
        }

        return this.trackerRepository.save(tracker);
    }
}
