import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { Job } from './entities/job.entity';
import { SavedJob } from './entities/saved-job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, SavedJob]), ScheduleModule.forRoot()],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
