import { Controller, Post, Get, Patch, Param, UseGuards, Body } from '@nestjs/common';
import { JobCrawlerService } from './job-crawler.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UpdateCrawlerConfigDto } from './dto/update-crawler-config.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CrawlerStatus, CrawlerStats } from './entities/crawler-stats.entity';
import { CrawlerConfig } from './entities/crawler-config.entity';

@ApiTags('Crawler')
@Controller('crawler')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class JobCrawlerController {
  constructor(private readonly crawlerService: JobCrawlerService) {}

  @Get('health')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get crawler health status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Crawler health status returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    sources: Record<
      string,
      {
        isActive: boolean;
        lastRun: Date | null;
        lastStatus: CrawlerStatus | null;
        totalJobsLast24h: number;
        errorsLast24h: number;
        avgDurationMs: number;
        rateLimitStatus: { currentDelay: number; consecutiveErrors: number };
      }
    >;
    recentRuns: CrawlerStats[];
  }> {
    return this.crawlerService.getHealth();
  }

  @Get('configs')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all crawler configurations (Admin only)' })
  @ApiResponse({ status: 200, description: 'Crawler configs returned.', type: [CrawlerConfig] })
  async getConfigs(): Promise<CrawlerConfig[]> {
    return this.crawlerService.getConfigs();
  }

  @Patch('configs/:source')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a specific crawler configuration (Admin only)' })
  @ApiParam({ name: 'source', description: 'Crawler source name (e.g., topcv)' })
  @ApiResponse({ status: 200, description: 'Crawler config updated.', type: CrawlerConfig })
  @ApiResponse({ status: 404, description: 'Config not found.' })
  async updateConfig(
    @Param('source') source: string,
    @Body() updateDto: UpdateCrawlerConfigDto,
  ): Promise<CrawlerConfig> {
    return this.crawlerService.updateConfig(source, updateDto);
  }

  @Post('trigger')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Trigger job crawler manually (Admin only)' })
  @ApiResponse({ status: 201, description: 'Crawler triggered in background.' })
  triggerCrawl(): { message: string } {
    // Trigger in background
    void this.crawlerService.handleCron();
    return { message: 'Crawler triggered in background' };
  }

  @Post('test')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Test crawler with specific URL' })
  @ApiResponse({ status: 201, description: 'Test crawl executed.' })
  async testCrawl(@Body() body: { url: string }): Promise<{ message: string }> {
    await this.crawlerService.crawlSpecificUrl(body.url);
    return { message: 'Test crawl executed' };
  }
}
