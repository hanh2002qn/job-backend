import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobAlertService } from './job-alert.service';
import { Job } from '../jobs/entities/job.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { MailModule } from '../mail/mail.module';
import { JobAlert } from './entities/job-alert.entity';
import { JobAlertController } from './job-alert.controller';
import { UserJobNotification } from './entities/user-job-notification.entity';
import { MatchingModule } from '../matching/matching.module';
import { JobAlertRepository } from './job-alert.repository';
import { UserJobNotificationRepository } from './user-job-notification.repository';
import { JobsModule } from '../jobs/jobs.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, Profile, JobAlert, UserJobNotification]),
    MailModule,
    MatchingModule,
    JobsModule,
    ProfilesModule,
  ],
  controllers: [JobAlertController],
  providers: [JobAlertService, JobAlertRepository, UserJobNotificationRepository],
  exports: [JobAlertService],
})
export class JobAlertModule {}
