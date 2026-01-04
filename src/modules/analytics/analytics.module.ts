import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TrackerModule } from '../tracker/tracker.module';
import { CvModule } from '../cv/cv.module';

@Module({
  imports: [TrackerModule, CvModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule { }
