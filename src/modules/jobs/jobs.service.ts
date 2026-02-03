import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { JobSearchDto } from './dto/job-search.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
  ) {}

  async create(jobData: Partial<Job>): Promise<Job> {
    const newJob = this.jobsRepository.create(jobData);
    return this.jobsRepository.save(newJob);
  }

  async findAll(searchDto: JobSearchDto) {
    const {
      keyword,
      location,
      minSalary,
      maxSalary,
      jobType,
      level,
      page = 1,
      limit = 10,
    } = searchDto;
    const query = this.jobsRepository.createQueryBuilder('job');

    if (keyword) {
      query.andWhere(
        '(job.title ILIKE :keyword OR job.description ILIKE :keyword OR job.skills ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (location) {
      query.andWhere('job.location ILIKE :location', {
        location: `%${location}%`,
      });
    }

    if (level) {
      query.andWhere('job.experienceLevel ILIKE :level', {
        level: `%${level}%`,
      });
    }

    if (jobType) {
      query.andWhere('job.jobType ILIKE :jobType', { jobType: `%${jobType}%` });
    }

    if (minSalary) {
      query.andWhere('job.salaryMin >= :minSalary', { minSalary });
    }

    if (maxSalary) {
      query.andWhere('job.salaryMax <= :maxSalary', { maxSalary });
    }

    query.andWhere('job.expired = :expired', { expired: false });
    query.orderBy('job.createdAt', 'DESC');

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Job | null> {
    return this.jobsRepository.findOne({ where: { id } });
  }

  async update(id: string, jobData: Partial<Job>): Promise<void> {
    await this.jobsRepository.update(id, jobData);
  }

  // Helper for crawler
  async findByExternalId(externalId: string): Promise<Job | null> {
    return this.jobsRepository.findOne({ where: { externalId } });
  }
}
