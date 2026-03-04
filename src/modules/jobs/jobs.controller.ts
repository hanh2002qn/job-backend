import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JobSearchDto } from './dto/job-search.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { OriginalJobData } from '../job-crawler/interfaces/job-crawler.interface';
import { Job } from './entities/job.entity';
import {
  Currency,
  JobType,
  JobLevel,
  Education,
  City,
  Gender,
  Industry,
  JobStatus,
} from './enums/job.enums';
import { SavedJob } from './entities/saved-job.entity';

@ApiTags('jobs')
@Controller('jobs')
@UseInterceptors(CacheInterceptor)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('search')
  @CacheTTL(300) // 5 minutes
  @ApiOperation({ summary: 'Search jobs with full-text search' })
  async search(@Query() query: JobSearchDto): Promise<{
    data: Job[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    return this.jobsService.findAll(query);
  }

  @Get('saved')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get saved/bookmarked jobs' })
  async getSavedJobs(
    @CurrentUser() user: User,
    @Query() pagination: PaginationDto,
  ): Promise<{
    data: {
      savedAt: Date;
      id: string;
      source: string;
      title: string;
      company: string;
      location: string;
      logoUrl: string;
      companyAddress: string;
      companySize: string;
      workingTime: string;
      companyType: string;
      salaryMin: number;
      salaryMax: number;
      currency: Currency;
      jobType: JobType;
      experienceLevel: JobLevel;
      level: string;
      category: string;
      categories: string[];
      education: Education;
      city: City;
      isBranded: boolean;
      tags: string[];
      quantity: number;
      gender: Gender;
      deadline: Date | null;
      allowance: string;
      equipment: string;
      industry: Industry;
      salary: string;
      description: string;
      requirements: string;
      benefits: string;
      skills: string[];
      originalData: OriginalJobData;
      expired: boolean;
      externalId: string | null;
      url: string;
      postedAt: Date | null;
      createdAt: Date;
      isVerified: boolean;
      isAlertSent: boolean;
      status: JobStatus;
      searchVector: string;
      expiresAt: Date | null;
      contentHash: string | null;
      updatedAt: Date;
    }[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    return this.jobsService.getSavedJobs(user.id, pagination);
  }

  @Get(':id')
  @CacheTTL(1800) // 30 minutes
  @ApiOperation({ summary: 'Get job detail' })
  async findOne(@Param('id') id: string): Promise<Job | null> {
    return this.jobsService.findOne(id);
  }

  @Post(':id/save')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Save/Bookmark a job' })
  async saveJob(@CurrentUser() user: User, @Param('id') id: string): Promise<SavedJob> {
    return this.jobsService.saveJob(user.id, id);
  }

  @Delete(':id/save')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unsave/Remove bookmark from job' })
  async unsaveJob(@CurrentUser() user: User, @Param('id') id: string): Promise<void> {
    return this.jobsService.unsaveJob(user.id, id);
  }
}
