import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobCrawlerService } from './job-crawler.service';
import { JobsModule } from '../jobs/jobs.module';
import { JobCrawlerController } from './job-crawler.controller';
import { TopCvCrawler } from './strategies/topcv.crawler';
import { LinkedInCrawler } from './strategies/linkedin.crawler';
import { IndeedCrawler } from './strategies/indeed.crawler';
import { TimviecnhanhCrawler } from './strategies/timviecnhanh.crawler';
import { ItviecCrawler } from './strategies/itviec.crawler';
import { TopDevCrawler } from './strategies/topdev.crawler';
import { VietnamWorksCrawler } from './strategies/vietnamworks.crawler';
import { UpworkCrawler } from './strategies/upwork.crawler';
import { FreelancerCrawler } from './strategies/freelancer.crawler';
import { Vieclam24hCrawler } from './strategies/vieclam24h.crawler';
import { Job123Crawler } from './strategies/123job.crawler';
import { FacebookCrawler } from './strategies/facebook.crawler';
import { JobNormalizationService } from './services/job-normalization.service';
import { DeduplicationService } from './services/deduplication.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { CrawlerStats } from './entities/crawler-stats.entity';
import { CrawlerConfig } from './entities/crawler-config.entity';
import { Job } from '../jobs/entities/job.entity';

@Module({
  imports: [JobsModule, TypeOrmModule.forFeature([CrawlerStats, CrawlerConfig, Job])],
  controllers: [JobCrawlerController],
  providers: [
    JobNormalizationService,
    DeduplicationService,
    RateLimiterService,
    JobCrawlerService,
    TopCvCrawler,
    LinkedInCrawler,
    IndeedCrawler,
    TimviecnhanhCrawler,
    ItviecCrawler,
    TopDevCrawler,
    VietnamWorksCrawler,
    UpworkCrawler,
    FreelancerCrawler,
    Vieclam24hCrawler,
    Job123Crawler,
    FacebookCrawler,
  ],
})
export class JobCrawlerModule {}
