import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Job } from './entities/job.entity';
import { SavedJob } from './entities/saved-job.entity';
import { JobSearchDto, JobSortBy } from './dto/job-search.dto';
import { SortOrder } from '../../common/dto/base-search.dto';
import { CacheService } from '../../common/redis/cache.service';
import { CACHE_KEYS, CACHE_TTL } from '../../common/redis/queue.constants';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(SavedJob)
    private savedJobsRepository: Repository<SavedJob>,
    private cacheService: CacheService,
  ) {}

  async create(jobData: Partial<Job>): Promise<Job> {
    // Set expiration date if not provided
    if (!jobData.expiresAt) {
      if (jobData.deadline) {
        jobData.expiresAt = jobData.deadline;
      } else {
        // Default: 30 days from now
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);
        jobData.expiresAt = expires;
      }
    }

    const newJob = this.jobsRepository.create(jobData);
    const savedJob = await this.jobsRepository.save(newJob);

    // Update search vector
    await this.updateSearchVector(savedJob.id);

    // Invalidate list cache when new job created
    void this.cacheService.delByPattern(`${CACHE_KEYS.JOBS_LIST}:*`);

    return savedJob;
  }

  async findAll(searchDto: JobSearchDto) {
    const cacheKey = this.cacheService.buildKey(CACHE_KEYS.JOBS_LIST, JSON.stringify(searchDto));

    return this.cacheService.wrap(
      cacheKey,
      async () => {
        const {
          keyword,
          location,
          city,
          experienceLevel,
          level,
          source,
          industry,
          category,
          minSalary,
          maxSalary,
          jobType,
          sortBy = JobSortBy.POSTED_AT,
          sortOrder = SortOrder.DESC,
          page = 1,
          limit = 10,
        } = searchDto;
        const query = this.jobsRepository.createQueryBuilder('job');

        // Full-text search with PostgreSQL tsvector
        if (keyword) {
          query.andWhere(
            "job.searchVector @@ plainto_tsquery('english', :keyword) OR " +
              'job.title ILIKE :likeKeyword OR job.company ILIKE :likeKeyword',
            { keyword, likeKeyword: `%${keyword}%` },
          );
          // Add ranking for full-text matches
          query.addSelect(
            "COALESCE(ts_rank(job.searchVector, plainto_tsquery('english', :keyword)), 0)",
            'search_rank',
          );
        }

        if (location) {
          query.andWhere('job.location ILIKE :location', {
            location: `%${location}%`,
          });
        }

        if (city) {
          query.andWhere('job.city = :city', { city });
        }

        if (experienceLevel) {
          query.andWhere('job.experienceLevel = :experienceLevel', { experienceLevel });
        }

        if (level) {
          query.andWhere('job.level ILIKE :level', {
            level: `%${level}%`,
          });
        }

        if (source) {
          query.andWhere('job.source = :source', { source });
        }

        if (industry) {
          query.andWhere('job.industry = :industry', { industry });
        }

        if (category) {
          query.andWhere('job.category ILIKE :category', { category: `%${category}%` });
        }

        if (jobType) {
          query.andWhere('job.jobType = :jobType', { jobType });
        }

        if (minSalary) {
          query.andWhere('job.salaryMin >= :minSalary', { minSalary });
        }

        if (maxSalary) {
          query.andWhere('job.salaryMax <= :maxSalary', { maxSalary });
        }

        // Filter expired jobs
        query.andWhere('job.expired = :expired', { expired: false });

        // Sorting logic
        if (keyword) {
          // Sort by relevance first when searching
          query.orderBy('search_rank', 'DESC');
          query.addOrderBy(`job.${sortBy}`, sortOrder);
        } else {
          query.orderBy(`job.${sortBy}`, sortOrder);
        }

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
      },
      CACHE_TTL.JOBS_LIST,
    );
  }

  async findOne(id: string): Promise<Job | null> {
    const cacheKey = this.cacheService.buildKey(CACHE_KEYS.JOB_DETAIL, id);
    return this.cacheService.wrap(
      cacheKey,
      () => this.jobsRepository.findOne({ where: { id } }),
      CACHE_TTL.JOB_DETAIL,
    );
  }

  async update(id: string, jobData: Partial<Job>): Promise<void> {
    await this.jobsRepository.update(id, jobData);

    // Update search vector
    await this.updateSearchVector(id);

    // Invalidate caches
    void this.cacheService.del(this.cacheService.buildKey(CACHE_KEYS.JOB_DETAIL, id));
    void this.cacheService.delByPattern(`${CACHE_KEYS.JOBS_LIST}:*`);
  }

  async remove(id: string): Promise<void> {
    await this.jobsRepository.delete(id);

    // Invalidate caches
    void this.cacheService.del(this.cacheService.buildKey(CACHE_KEYS.JOB_DETAIL, id));
    void this.cacheService.delByPattern(`${CACHE_KEYS.JOBS_LIST}:*`);
  }

  // Helper for crawler
  async findByExternalId(externalId: string): Promise<Job | null> {
    return this.jobsRepository.findOne({ where: { externalId } });
  }

  // ============ Full-text Search Vector ============

  private async updateSearchVector(jobId: string): Promise<void> {
    // Update tsvector using PostgreSQL function
    await this.jobsRepository.query(
      `UPDATE jobs SET "searchVector" = 
        setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(company, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(description, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(skills, ' '), '')), 'B')
      WHERE id = $1`,
      [jobId],
    );
  }

  // ============ Save/Bookmark Jobs ============

  async saveJob(userId: string, jobId: string): Promise<SavedJob> {
    const job = await this.findOne(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const existing = await this.savedJobsRepository.findOne({
      where: { userId, jobId },
    });

    if (existing) {
      throw new ConflictException('Job already saved');
    }

    const savedJob = this.savedJobsRepository.create({ userId, jobId });
    return this.savedJobsRepository.save(savedJob);
  }

  async unsaveJob(userId: string, jobId: string): Promise<void> {
    const result = await this.savedJobsRepository.delete({ userId, jobId });
    if (result.affected === 0) {
      throw new NotFoundException('Saved job not found');
    }
  }

  async getSavedJobs(userId: string, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.savedJobsRepository.findAndCount({
      where: { userId },
      relations: ['job'],
      order: { savedAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: items.map((saved) => ({ ...saved.job, savedAt: saved.savedAt })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async isJobSaved(userId: string, jobId: string): Promise<boolean> {
    const saved = await this.savedJobsRepository.findOne({
      where: { userId, jobId },
    });
    return !!saved;
  }

  // ============ Job Expiration Management ============

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async markExpiredJobs(): Promise<void> {
    const now = new Date();

    // Mark expired by expiresAt
    await this.jobsRepository.update(
      { expired: false, expiresAt: LessThan(now) },
      { expired: true },
    );

    // Mark expired by deadline
    await this.jobsRepository.update(
      { expired: false, deadline: LessThan(now) },
      { expired: true },
    );

    // Invalidate caches
    void this.cacheService.delByPattern(`${CACHE_KEYS.JOBS_LIST}:*`);
  }

  // Get recent jobs for AI matching
  async getRecentJobs(limit: number = 50): Promise<Job[]> {
    return this.jobsRepository.find({
      where: { expired: false },
      order: { postedAt: 'DESC' },
      take: limit,
    });
  }
}
