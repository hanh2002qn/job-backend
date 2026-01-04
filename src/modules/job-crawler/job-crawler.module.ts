import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobCrawlerService } from './job-crawler.service';
import { JobsModule } from '../jobs/jobs.module';
import { JobCrawlerController } from './job-crawler.controller';
import { TopCvCrawler } from './strategies/topcv.crawler';
import { LinkedInCrawler } from './strategies/linkedin.crawler';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    JobsModule,
  ],
  controllers: [JobCrawlerController],
  providers: [JobCrawlerService, TopCvCrawler, LinkedInCrawler],
})
export class JobCrawlerModule { }
