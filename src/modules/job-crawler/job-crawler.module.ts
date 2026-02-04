import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobCrawlerService } from './job-crawler.service';
import { JobsModule } from '../jobs/jobs.module';
import { JobCrawlerController } from './job-crawler.controller';
import { TopCvCrawler } from './strategies/topcv.crawler';
import { LinkedInCrawler } from './strategies/linkedin.crawler';
import { JobNormalizationService } from './services/job-normalization.service';
import { DeduplicationService } from './services/deduplication.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { CrawlerStats } from './entities/crawler-stats.entity';
import { Job } from '../jobs/entities/job.entity';

@Module({
  imports: [JobsModule, TypeOrmModule.forFeature([CrawlerStats, Job])],
  controllers: [JobCrawlerController],
  providers: [
    JobNormalizationService,
    DeduplicationService,
    RateLimiterService,
    JobCrawlerService,
    TopCvCrawler,
    LinkedInCrawler,
  ],
})
export class JobCrawlerModule {}
