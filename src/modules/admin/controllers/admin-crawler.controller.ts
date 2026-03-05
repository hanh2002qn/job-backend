import { Controller, Post, Body, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES, JOB_TYPES } from '../../../common/redis/queue.constants';
import { UserRole } from '../../users/entities/user.entity';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { JobCrawlerService } from '../../job-crawler/job-crawler.service';
import { UpdateCrawlerConfigDto } from '../../job-crawler/dto/update-crawler-config.dto';

@ApiTags('admin/crawler')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/crawler')
export class AdminCrawlerController {
  constructor(
    @InjectQueue(QUEUES.CRAWLER) private readonly crawlerQueue: Queue,
    private readonly jobCrawlerService: JobCrawlerService,
  ) {}

  @Get('configs')
  @ApiOperation({ summary: 'Get all crawler configurations' })
  async getConfigs() {
    return this.jobCrawlerService.getConfigs();
  }

  @Patch('configs/:source')
  @ApiOperation({ summary: 'Update crawler configuration' })
  async updateConfig(@Param('source') source: string, @Body() updateDto: UpdateCrawlerConfigDto) {
    return this.jobCrawlerService.updateConfig(source, updateDto);
  }

  @Get('health')
  @ApiOperation({ summary: 'Get crawler health and statistics' })
  async getHealth() {
    return this.jobCrawlerService.getHealth();
  }

  @Post('trigger')
  @ApiOperation({ summary: 'Trigger job crawler manually' })
  @ApiResponse({ status: 201, description: 'Crawler triggered or platform unsupported.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  async triggerCrawler(
    @Body('platform') platform: string,
  ): Promise<{ message: string; triggered: boolean }> {
    const jobKey = `CRAWL_${platform.toUpperCase()}` as keyof typeof JOB_TYPES;
    const jobName = JOB_TYPES[jobKey];

    if (!jobName) {
      return {
        message: `Unsupported platform: ${platform}. Defaulting to TopCV...`,
        triggered: false,
      };
    }

    await this.crawlerQueue.add(jobName, { platform });
    return { message: `Crawler triggered for ${platform}`, triggered: true };
  }
}
