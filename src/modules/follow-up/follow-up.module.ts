import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowUpService } from './follow-up.service';
import { FollowUpController } from './follow-up.controller';
import { FollowUp } from './entities/follow-up.entity';
import { JobsModule } from '../jobs/jobs.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { SubscriptionModule } from '../subscription/subscription.module';

import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FollowUp]),
    JobsModule,
    ProfilesModule,
    SubscriptionModule,
    AIModule,
  ],
  controllers: [FollowUpController],
  providers: [FollowUpService],
  exports: [FollowUpService],
})
export class FollowUpModule {}
