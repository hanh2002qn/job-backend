import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobTracker, ApplicationStatus } from './entities/job-tracker.entity';
import { CreateTrackerDto } from './dto/create-tracker.dto';

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

    async findAll(userId: string) {
        return this.trackerRepository.find({
            where: { userId },
            relations: ['job'],
            order: { updatedAt: 'DESC' },
        });
    }

    async updateStatus(id: string, userId: string, status: ApplicationStatus) {
        const tracker = await this.trackerRepository.findOne({ where: { id, userId } });
        if (!tracker) {
            throw new NotFoundException('Tracker entry not found');
        }
        tracker.status = status;
        return this.trackerRepository.save(tracker);
    }
}
