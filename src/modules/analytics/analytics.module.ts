import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SubscriptionModule } from '../subscription/subscription.module';
import { RedisModule } from '../../common/redis/redis.module';

import { TrackerModule } from '../tracker/tracker.module';
import { CvModule } from '../cv/cv.module';
import { FollowUpModule } from '../follow-up/follow-up.module';

@Module({
  imports: [TrackerModule, CvModule, FollowUpModule, SubscriptionModule, RedisModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
