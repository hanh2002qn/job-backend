import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { Job } from './entities/job.entity';
import { SavedJob } from './entities/saved-job.entity';
import { JobsRepository } from './jobs.repository';
import { SavedJobRepository } from './saved-job.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Job, SavedJob]), ScheduleModule.forRoot()],
  controllers: [JobsController],
  providers: [JobsService, JobsRepository, SavedJobRepository],
  exports: [JobsService, JobsRepository, SavedJobRepository],
})
export class JobsModule {}
