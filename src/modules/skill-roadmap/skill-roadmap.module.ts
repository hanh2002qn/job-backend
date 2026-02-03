import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillRoadmapService } from './skill-roadmap.service';
import { SkillRoadmapController } from './skill-roadmap.controller';
import { SkillRoadmap } from './entities/skill-roadmap.entity';
import { ProfilesModule } from '../profiles/profiles.module';
import { JobsModule } from '../jobs/jobs.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([SkillRoadmap]), ProfilesModule, JobsModule, AIModule],
  controllers: [SkillRoadmapController],
  providers: [SkillRoadmapService],
  exports: [SkillRoadmapService],
})
export class SkillRoadmapModule {}
