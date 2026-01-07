import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { CvModule } from '../cv/cv.module';

@Module({
  imports: [CvModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
