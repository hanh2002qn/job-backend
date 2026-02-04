import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('matching')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('jobs')
  @ApiOperation({ summary: 'Get jobs matched to user profile (rule-based)' })
  async getMatchedJobs(@CurrentUser() user: User) {
    return this.matchingService.matchJobs(user.id);
  }

  @Get('ai-recommendations')
  @ApiOperation({ summary: 'Get AI-powered job recommendations based on profile' })
  async getAIRecommendations(@CurrentUser() user: User) {
    return this.matchingService.getAIRecommendations(user.id);
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get personalized job feed (AI + Rule-based)' })
  async getFeed(
    @CurrentUser() user: User,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.matchingService.getFeed(user.id, +page, +limit);
  }

  @Get('job/:jobId/semantic')
  @ApiOperation({ summary: 'Get detailed AI semantic matching analysis' })
  async getSemanticMatch(@CurrentUser() user: User, @Param('jobId') jobId: string) {
    return this.matchingService.getSemanticMatch(user.id, jobId);
  }

  @Get('job/:jobId')
  @ApiOperation({
    summary: 'Get detailed rule-based matching analysis',
  })
  async getJobDetail(@CurrentUser() user: User, @Param('jobId') jobId: string) {
    return this.matchingService.matchSpecificJob(user.id, jobId);
  }
}
