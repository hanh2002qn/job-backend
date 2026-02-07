import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { JobStatus } from '../../jobs/enums/job.enums';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Admin Moderation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/moderation')
export class AdminModerationController {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get('jobs')
  @ApiOperation({ summary: 'List jobs for moderation' })
  @ApiQuery({ name: 'status', enum: JobStatus, required: false })
  async listJobs(@Query('status') status?: JobStatus) {
    const query = this.jobRepository.createQueryBuilder('job');
    if (status) {
      query.where('job.status = :status', { status });
    } else {
      // Default to PENDING if not specified, or all?
      // Let's return PENDING by default for moderation queue.
      query.where('job.status = :status', { status: JobStatus.PENDING });
    }
    return query.orderBy('job.createdAt', 'DESC').getMany();
  }

  @Patch('jobs/:id/status')
  @ApiOperation({ summary: 'Approve or Reject a job' })
  async updateJobStatus(@Param('id') id: string, @Body('status') status: JobStatus) {
    await this.jobRepository.update(id, { status });
    return this.jobRepository.findOne({ where: { id } });
  }

  @Patch('users/:id/ban')
  @ApiOperation({ summary: 'Ban or Unban a user' })
  async banUser(@Param('id') id: string, @Body('isBanned') isBanned: boolean) {
    await this.userRepository.update(id, { isBanned });
    return this.userRepository.findOne({ where: { id } });
  }
}
