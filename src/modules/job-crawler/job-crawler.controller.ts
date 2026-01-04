import { Controller, Post } from '@nestjs/common';
import { JobCrawlerService } from './job-crawler.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Crawler')
@Controller('crawler')
export class JobCrawlerController {
    constructor(private readonly crawlerService: JobCrawlerService) { }

    @Post('trigger')
    @ApiOperation({ summary: 'Trigger job crawler manually' })
    async triggerCrawl() {
        // Trigger in background
        this.crawlerService.handleCron();
        return { message: 'Crawler triggered in background' };
    }
}
