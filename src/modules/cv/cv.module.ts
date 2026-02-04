import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { CV } from './entities/cv.entity';
import { CvVersion } from './entities/cv-version.entity';
import { PdfService } from './services/pdf.service';
import { CvRendererService } from './services/cv-renderer.service';
import { JobsModule } from '../jobs/jobs.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CV, CvVersion]),
    JobsModule,
    ProfilesModule,
    SubscriptionModule,
    AIModule,
  ],
  controllers: [CvController],
  providers: [CvService, PdfService, CvRendererService],
  exports: [CvService, PdfService, CvRendererService],
})
export class CvModule {}
