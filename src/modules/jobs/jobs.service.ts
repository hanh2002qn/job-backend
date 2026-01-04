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
        const { keyword, location, minSalary, maxSalary, jobType, level } = searchDto;
        const query = this.jobsRepository.createQueryBuilder('job');

        if (keyword) {
            query.andWhere('(job.title ILIKE :keyword OR job.description ILIKE :keyword OR job.skills ILIKE :keyword)', { keyword: `%${keyword}%` });
        }

        if (location) {
            query.andWhere('job.location ILIKE :location', { location: `%${location}%` });
        }

        if (level) {
            query.andWhere('job.experienceLevel ILIKE :level', { level: `%${level}%` });
        }

        if (jobType) {
            query.andWhere('job.jobType ILIKE :jobType', { jobType: `%${jobType}%` });
        }

        if (minSalary) {
            query.andWhere('job.salaryMin >= :minSalary', { minSalary });
        }

        // if maxSalary is provided, we want jobs where the max range is at least somewhat relevant or within budget
        // Simplified logic: Show jobs where salaryMax <= provided max (within budget) OR undefined
        // Actually, usually filters work as 'Show jobs paying AT LEAST X' (min) or '... UP TO Y' (max)
        // Let's implement literally:
        if (maxSalary) {
            query.andWhere('job.salaryMax <= :maxSalary', { maxSalary });
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
