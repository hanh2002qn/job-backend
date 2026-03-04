import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JobsService } from '../../jobs/jobs.service';
import { Job } from '../../jobs/entities/job.entity';
import { JobSearchDto } from '../../jobs/dto/job-search.dto';
import { UserRole } from '../../users/entities/user.entity';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('admin/jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/jobs')
export class AdminJobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all jobs (with filters)' })
  @ApiResponse({ status: 200, description: 'Paginated list of jobs.' })
  async findAll(@Query() query: JobSearchDto): Promise<{
    data: Job[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    return this.jobsService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create new job' })
  @ApiResponse({ status: 201, description: 'Job created.', type: Job })
  async create(@Body() jobData: Partial<Job>): Promise<Job> {
    return this.jobsService.create(jobData);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update job' })
  @ApiParam({ name: 'id', description: 'Job ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Job updated.' })
  @ApiResponse({ status: 404, description: 'Job not found.' })
  async update(@Param('id') id: string, @Body() jobData: Partial<Job>): Promise<void> {
    return this.jobsService.update(id, jobData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete job' })
  @ApiParam({ name: 'id', description: 'Job ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Job deleted.' })
  @ApiResponse({ status: 404, description: 'Job not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.jobsService.remove(id);
  }
}
