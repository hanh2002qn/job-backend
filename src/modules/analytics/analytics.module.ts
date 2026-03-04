import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SubscriptionModule } from '../subscription/subscription.module';
import { FollowUp } from '../follow-up/entities/follow-up.entity';
import { JobTracker } from '../tracker/entities/job-tracker.entity';
import { CV } from '../cv/entities/cv.entity';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([JobTracker, CV, FollowUp]), SubscriptionModule, RedisModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
