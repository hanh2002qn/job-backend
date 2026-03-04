import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';
import { User } from '../../users/entities/user.entity';
import { JobStatus } from '../../jobs/enums/job.enums';

@Injectable()
export class AdminModerationService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async listJobsForModeration(status?: JobStatus): Promise<Job[]> {
    const query = this.jobRepository.createQueryBuilder('job');
    if (status) {
      query.where('job.status = :status', { status });
    } else {
      query.where('job.status = :status', { status: JobStatus.PENDING });
    }
    return query.orderBy('job.createdAt', 'DESC').getMany();
  }

  async updateJobStatus(id: string, status: JobStatus): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    job.status = status;
    return this.jobRepository.save(job);
  }

  async banUser(id: string, isBanned: boolean): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isBanned = isBanned;
    return this.userRepository.save(user);
  }
}
