import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from './common/redis/redis.module';
import { getTypeOrmConfig } from './config/typeorm.config';

// Import processors
import { CrawlerProcessor } from './processors/crawler.processor';
import { EmailProcessor } from './processors/email.processor';

// Import required modules for processors
import { JobCrawlerModule } from './modules/job-crawler/job-crawler.module';
import { MailModule } from './modules/mail/mail.module';
import { TrackerModule } from './modules/tracker/tracker.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';

// Import scheduler service
import { WorkerSchedulerService } from './services/worker-scheduler.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    // Only import modules needed by processors
    JobCrawlerModule,
    MailModule,
    TrackerModule,
    SubscriptionModule, // Required by TrackerModule
  ],
  providers: [
    // Queue processors
    CrawlerProcessor,
    EmailProcessor,
    // Scheduler service for repeatable jobs
    WorkerSchedulerService,
  ],
})
export class WorkerModule {}
