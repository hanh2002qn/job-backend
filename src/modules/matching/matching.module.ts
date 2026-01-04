import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { JobsModule } from '../jobs/jobs.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [JobsModule, ProfilesModule],
  controllers: [MatchingController],
  providers: [MatchingService],
})
export class MatchingModule { }
