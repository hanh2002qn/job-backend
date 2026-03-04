import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';
import { JobStatus } from '../../jobs/enums/job.enums';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuditAction } from '../../../common/decorators/audit-log.decorator';
import { AdminModerationService } from '../services/admin-moderation.service';

@ApiTags('Admin Moderation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/moderation')
export class AdminModerationController {
  constructor(private readonly moderationService: AdminModerationService) {}

  @Get('jobs')
  @ApiOperation({ summary: 'List jobs for moderation' })
  @ApiQuery({ name: 'status', enum: JobStatus, required: false })
  async listJobs(@Query('status') status?: JobStatus) {
    return this.moderationService.listJobsForModeration(status);
  }

  @Patch('jobs/:id/status')
  @AuditAction({ action: 'MODERATE_JOB', module: 'MODERATION' })
  @ApiOperation({ summary: 'Approve or Reject a job' })
  async updateJobStatus(@Param('id') id: string, @Body('status') status: JobStatus) {
    return this.moderationService.updateJobStatus(id, status);
  }

  @Patch('users/:id/ban')
  @AuditAction({ action: 'BAN_USER', module: 'MODERATION' })
  @ApiOperation({ summary: 'Ban or Unban a user' })
  async banUser(@Param('id') id: string, @Body('isBanned') isBanned: boolean) {
    return this.moderationService.banUser(id, isBanned);
  }
}
