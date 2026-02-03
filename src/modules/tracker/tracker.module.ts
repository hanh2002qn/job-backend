import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackerService } from './tracker.service';
import { TrackerController } from './tracker.controller';
import { JobTracker } from './entities/job-tracker.entity';
import { InterviewSchedule } from './entities/interview-schedule.entity';
import { SubscriptionModule } from '../subscription/subscription.module';
import { JobsModule } from '../jobs/jobs.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobTracker, InterviewSchedule]),
    JobsModule,
    SubscriptionModule,
    AIModule,
  ],
  controllers: [TrackerController],
  providers: [TrackerService],
  exports: [TrackerService],
})
export class TrackerModule {}
