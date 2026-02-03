import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES, JOB_TYPES } from '../../../common/redis/queue.constants';
import { UserRole } from '../../users/entities/user.entity';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('admin/crawler')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/crawler')
export class AdminCrawlerController {
  constructor(@InjectQueue(QUEUES.CRAWLER) private readonly crawlerQueue: Queue) {}

  @Post('trigger')
  @ApiOperation({ summary: 'Trigger job crawler manually' })
  async triggerCrawler(@Body('platform') platform: string) {
    let jobName: string = JOB_TYPES.CRAWL_TOPCV;

    if (platform === 'linkedin') {
      jobName = JOB_TYPES.CRAWL_LINKEDIN;
    } else if (platform === 'vietnamworks') {
      jobName = JOB_TYPES.CRAWL_VIETNAMWORKS;
    }

    await this.crawlerQueue.add(jobName, { platform });
    return { message: `Crawler triggered for ${platform || 'topcv'}` };
  }
}
