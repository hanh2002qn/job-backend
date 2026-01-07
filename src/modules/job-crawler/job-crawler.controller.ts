import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { JobCrawlerService } from './job-crawler.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Crawler')
@Controller('crawler')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class JobCrawlerController {
  constructor(private readonly crawlerService: JobCrawlerService) {}

  @Post('trigger')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Trigger job crawler manually (Admin only)' })
  async triggerCrawl() {
    // Trigger in background
    this.crawlerService.handleCron();
    return { message: 'Crawler triggered in background' };
  }

  @Post('test')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Test crawler with specific URL' })
  async testCrawl(@Body() body: { url: string }) {
    await this.crawlerService.crawlSpecificUrl(body.url);
    return { message: 'Test crawl executed' };
  }
}
