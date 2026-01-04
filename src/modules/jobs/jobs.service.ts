import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Job } from './entities/job.entity';
import { JobSearchDto } from './dto/job-search.dto';

@Injectable()
export class JobsService {
    constructor(
        @InjectRepository(Job)
        private jobsRepository: Repository<Job>,
    ) { }

    async create(jobData: Partial<Job>): Promise<Job> {
        const newJob = this.jobsRepository.create(jobData);
        return this.jobsRepository.save(newJob);
    }

    async findAll(searchDto: JobSearchDto): Promise<Job[]> {
        const { keyword, location } = searchDto;
        const query = this.jobsRepository.createQueryBuilder('job');

        if (keyword) {
            query.andWhere('(job.title ILIKE :keyword OR job.description ILIKE :keyword)', { keyword: `%${keyword}%` });
        }

        if (location) {
            query.andWhere('job.location ILIKE :location', { location: `%${location}%` });
        }

        query.andWhere('job.expired = :expired', { expired: false });
        query.orderBy('job.createdAt', 'DESC');

        return query.getMany();
    }

    async findOne(id: string): Promise<Job | null> {
        return this.jobsRepository.findOne({ where: { id } });
    }

    // Helper for crawler
    async findByExternalId(externalId: string): Promise<Job | null> {
        return this.jobsRepository.findOne({ where: { externalId } });
    }
}
