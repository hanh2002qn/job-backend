import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { getTypeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 1000,
      },
    ]),
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
