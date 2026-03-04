import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UserRole, User } from '../../users/entities/user.entity';
import { JobStatus } from '../../jobs/enums/job.enums';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuditAction } from '../../../common/decorators/audit-log.decorator';
import { AdminModerationService } from '../services/admin-moderation.service';
import { Job } from '../../jobs/entities/job.entity';

@ApiTags('Admin Moderation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/moderation')
export class AdminModerationController {
  constructor(private readonly moderationService: AdminModerationService) {}

  @Get('jobs')
  @ApiOperation({ summary: 'List jobs for moderation' })
  @ApiResponse({ status: 200, description: 'Jobs pending moderation returned.', type: [Job] })
  @ApiQuery({ name: 'status', enum: JobStatus, required: false })
  async listJobs(@Query('status') status?: JobStatus): Promise<Job[]> {
    return this.moderationService.listJobsForModeration(status);
  }

  @Patch('jobs/:id/status')
  @AuditAction({ action: 'MODERATE_JOB', module: 'MODERATION' })
  @ApiOperation({ summary: 'Approve or Reject a job' })
  @ApiParam({ name: 'id', description: 'Job ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Job status updated.', type: Job })
  @ApiResponse({ status: 404, description: 'Job not found.' })
  async updateJobStatus(@Param('id') id: string, @Body('status') status: JobStatus): Promise<Job> {
    return this.moderationService.updateJobStatus(id, status);
  }

  @Patch('users/:id/ban')
  @AuditAction({ action: 'BAN_USER', module: 'MODERATION' })
  @ApiOperation({ summary: 'Ban or Unban a user' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, description: 'User ban status updated.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async banUser(@Param('id') id: string, @Body('isBanned') isBanned: boolean): Promise<User> {
    return this.moderationService.banUser(id, isBanned);
  }
}
