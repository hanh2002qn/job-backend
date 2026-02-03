import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MockInterview, InterviewMessage } from './entities/mock-interview.entity';
import { MockInterviewService } from './mock-interview.service';
import { MockInterviewController } from './mock-interview.controller';
import { ProfilesModule } from '../profiles/profiles.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MockInterview, InterviewMessage]),
    ProfilesModule,
    JobsModule,
  ],
  providers: [MockInterviewService],
  controllers: [MockInterviewController],
})
export class MockInterviewModule {}
