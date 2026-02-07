import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MockInterview, InterviewMessage } from './entities/mock-interview.entity';
import { MockInterviewService } from './mock-interview.service';
import { MockInterviewController } from './mock-interview.controller';
import { ProfilesModule } from '../profiles/profiles.module';
import { JobsModule } from '../jobs/jobs.module';
import { UserCredits } from '../users/entities/user-credits.entity';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MockInterview, InterviewMessage, UserCredits]),
    ProfilesModule,
    JobsModule,
    AIModule,
  ],
  providers: [MockInterviewService],
  controllers: [MockInterviewController],
})
export class MockInterviewModule {}
