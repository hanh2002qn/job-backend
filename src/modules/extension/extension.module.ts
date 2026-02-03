import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExtensionController } from './extension.controller';
import { ExtensionService } from './extension.service';
import { JobTracker } from '../tracker/entities/job-tracker.entity';
import { Job } from '../jobs/entities/job.entity';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([JobTracker, Job]), AIModule],
  controllers: [ExtensionController],
  providers: [ExtensionService],
  exports: [ExtensionService],
})
export class ExtensionModule {}
