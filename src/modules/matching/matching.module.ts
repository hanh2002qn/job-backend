import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { JobsModule } from '../jobs/jobs.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [JobsModule, ProfilesModule, AIModule],
  controllers: [MatchingController],
  providers: [MatchingService],
})
export class MatchingModule {}
