import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService, type AnalyticsPeriod, AnalyticsOverview } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user: User;
}

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get application analytics overview' })
  @ApiResponse({ status: 200, description: 'Analytics overview returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['7d', '30d', '90d'],
    description: 'Timeline period (default: 7d)',
  })
  async getOverview(
    @Request() req: AuthenticatedRequest,
    @Query('period') period?: string,
  ): Promise<AnalyticsOverview> {
    return this.analyticsService.getOverview(req.user.id, (period as AnalyticsPeriod) || '7d');
  }
}
