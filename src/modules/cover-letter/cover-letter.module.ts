import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoverLetterService } from './cover-letter.service';
import { CoverLetterController } from './cover-letter.controller';
import { CoverLetter } from './entities/cover-letter.entity';
import { JobsModule } from '../jobs/jobs.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { CvModule } from '../cv/cv.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoverLetter]),
    JobsModule,
    ProfilesModule,
    CvModule,
  ],
  controllers: [CoverLetterController],
  providers: [CoverLetterService],
  exports: [CoverLetterService],
})
export class CoverLetterModule {}
