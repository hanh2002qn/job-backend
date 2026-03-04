import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { CvModule } from '../cv/cv.module';
import { TrackerModule } from '../tracker/tracker.module';
import { CoverLetterModule } from '../cover-letter/cover-letter.module';

@Module({
  imports: [CvModule, TrackerModule, CoverLetterModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
