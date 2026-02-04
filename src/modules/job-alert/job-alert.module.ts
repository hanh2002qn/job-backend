import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobAlertService } from './job-alert.service';
import { Job } from '../jobs/entities/job.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { MailModule } from '../mail/mail.module';
import { JobAlert } from './entities/job-alert.entity';
import { JobAlertController } from './job-alert.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Profile, JobAlert]), MailModule],
  controllers: [JobAlertController],
  providers: [JobAlertService],
  exports: [JobAlertService],
})
export class JobAlertModule {}
