import { Module } from '@nestjs/common';
import { JobCrawlerService } from './job-crawler.service';
import { JobsModule } from '../jobs/jobs.module';
import { JobCrawlerController } from './job-crawler.controller';
import { TopCvCrawler } from './strategies/topcv.crawler';
import { LinkedInCrawler } from './strategies/linkedin.crawler';
import { JobNormalizationService } from './services/job-normalization.service';

@Module({
  imports: [JobsModule],
  controllers: [JobCrawlerController],
  providers: [JobNormalizationService, JobCrawlerService, TopCvCrawler, LinkedInCrawler],
})
export class JobCrawlerModule {}
