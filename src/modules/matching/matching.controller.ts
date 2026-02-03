import { Controller, Get, UseGuards, Param } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Get jobs matched to user profile' })
  async getMatchedJobs(@CurrentUser() user: User) {
    return this.matchingService.matchJobs(user.id);
  }

  @Get('job/:jobId')
  @ApiOperation({
    summary: 'Get detailed matching analysis for a specific job',
  })
  async getJobDetail(@CurrentUser() user: User, @Param('jobId') jobId: string) {
    return this.matchingService.matchSpecificJob(user.id, jobId);
  }
}
