import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TrackerModule } from '../tracker/tracker.module';
import { CvModule } from '../cv/cv.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowUp } from '../follow-up/entities/follow-up.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FollowUp]), TrackerModule, CvModule, SubscriptionModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
