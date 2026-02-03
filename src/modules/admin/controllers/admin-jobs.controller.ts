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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  async findAll(@Query() query: JobSearchDto) {
    return this.jobsService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create new job' })
  async create(@Body() jobData: Partial<Job>) {
    return this.jobsService.create(jobData);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update job' })
  async update(@Param('id') id: string, @Body() jobData: Partial<Job>) {
    return this.jobsService.update(id, jobData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete job' })
  async remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }
}
