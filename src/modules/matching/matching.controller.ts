import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatchingService, FeedItem } from './matching.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiFeatureGuard } from '../../common/guards/ai-feature.guard';
import { AiFeature } from '../../common/decorators/ai-feature.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import {
  Currency,
  JobType,
  JobLevel,
  Education,
  City,
  Gender,
  Industry,
  JobStatus,
} from '../jobs/enums/job.enums';
import { OriginalJobData } from '../job-crawler/interfaces/job-crawler.interface';
import { Job } from '../jobs/entities/job.entity';

@ApiTags('matching')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('jobs')
  @ApiOperation({ summary: 'Get jobs matched to user profile (rule-based)' })
  async getMatchedJobs(@CurrentUser() user: User): Promise<
    {
      matchScore: number;
      matchedSkills: string[];
      missingSkills: string[];
      skillGap: number;
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
    }[]
  > {
    return this.matchingService.matchJobs(user.id);
  }

  @Get('ai-recommendations')
  @UseGuards(AiFeatureGuard)
  @AiFeature('job_matching')
  @ApiOperation({ summary: 'Get AI-powered job recommendations based on profile' })
  async getAIRecommendations(@CurrentUser() user: User): Promise<
    | { recommendations: never[]; message: string; profileCompleteness?: undefined }
    | {
        recommendations: { job: Job | null; jobId: string; score: number; reasoning: string }[];
        profileCompleteness: number;
        message?: undefined;
      }
  > {
    return this.matchingService.getAIRecommendations(user.id);
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get personalized job feed (AI + Rule-based)' })
  async getFeed(
    @CurrentUser() user: User,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<{
    data: FeedItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    return this.matchingService.getFeed(user.id, +page, +limit);
  }

  @Get('job/:jobId/semantic')
  @UseGuards(AiFeatureGuard)
  @AiFeature('job_matching')
  @ApiOperation({ summary: 'Get detailed AI semantic matching analysis' })
  async getSemanticMatch(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
  ): Promise<unknown> {
    return this.matchingService.getSemanticMatch(user.id, jobId);
  }

  @Get('job/:jobId')
  @ApiOperation({
    summary: 'Get detailed rule-based matching analysis',
  })
  async getJobDetail(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
  ): Promise<{
    recommendations: string;
    experienceMatch: boolean;
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    skillGap: number;
    job: Job;
  }> {
    return this.matchingService.matchSpecificJob(user.id, jobId);
  }
}
