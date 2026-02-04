import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackerService } from './tracker.service';
import { TrackerController } from './tracker.controller';
import { JobTracker } from './entities/job-tracker.entity';
import { InterviewSchedule } from './entities/interview-schedule.entity';
import { TrackerNote } from './entities/tracker-note.entity';
import { GoogleCalendarService } from './services/google-calendar.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { JobsModule } from '../jobs/jobs.module';
import { MailModule } from '../mail/mail.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobTracker, InterviewSchedule, TrackerNote]),
    JobsModule,
    SubscriptionModule,
    MailModule,
    AIModule,
  ],
  controllers: [TrackerController],
  providers: [TrackerService, GoogleCalendarService],
  exports: [TrackerService],
})
export class TrackerModule {}
