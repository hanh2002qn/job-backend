import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { JobCrawlerModule } from './modules/job-crawler/job-crawler.module';
import { TrackerModule } from './modules/tracker/tracker.module';
import { CvModule } from './modules/cv/cv.module';
import { CoverLetterModule } from './modules/cover-letter/cover-letter.module';
import { FollowUpModule } from './modules/follow-up/follow-up.module';
import { MatchingModule } from './modules/matching/matching.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ExportModule } from './modules/export/export.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { MailModule } from './modules/mail/mail.module';
import { JobAlertModule } from './modules/job-alert/job-alert.module';
import { ExtensionModule } from './modules/extension/extension.module';
import { AdminModule } from './modules/admin/admin.module';
import { AIModule } from './modules/ai/ai.module';
import { AiFeatureModule } from './modules/ai/ai-feature.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { MockInterviewModule } from './modules/mock-interview/mock-interview.module';
import { SkillRoadmapModule } from './modules/skill-roadmap/skill-roadmap.module';
import { RedisModule } from './common/redis/redis.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { getTypeOrmConfig } from './config/typeorm.config';
import { HealthModule } from './modules/health/health.module';

import { S3Service } from './common/services/s3.service';
import { MaintenanceMiddleware } from './common/middleware/maintenance.middleware';

@Module({
  imports: [
    // Note: ScheduleModule removed - all cron/schedule jobs now run in worker app only
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60000,
            limit: 60,
          },
        ],
        storage: new ThrottlerStorageRedisService({
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD'),
        }),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    ProfilesModule,
    JobsModule,
    JobCrawlerModule,
    TrackerModule,
    CvModule,
    CoverLetterModule,
    FollowUpModule,
    MatchingModule,
    AnalyticsModule,
    ExportModule,
    SubscriptionModule,
    MailModule,
    JobAlertModule,
    ExtensionModule,
    AdminModule,
    AIModule,
    AiFeatureModule,
    MockInterviewModule,
    SkillRoadmapModule,
    RedisModule,
    NotificationsModule,
    FeedbackModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    S3Service,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MaintenanceMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
