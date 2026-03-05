import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoverLetterService } from './cover-letter.service';
import { CoverLetterController } from './cover-letter.controller';
import { CoverLetter } from './entities/cover-letter.entity';
import { CoverLetterRepository } from './cover-letter.repository';
import { JobsModule } from '../jobs/jobs.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { CvModule } from '../cv/cv.module';
import { CoverLetterRendererService } from './services/cover-letter-renderer.service';

@Module({
  imports: [TypeOrmModule.forFeature([CoverLetter]), JobsModule, ProfilesModule, CvModule],
  controllers: [CoverLetterController],
  providers: [CoverLetterService, CoverLetterRendererService, CoverLetterRepository],
  exports: [CoverLetterService, CoverLetterRendererService],
})
export class CoverLetterModule {}
