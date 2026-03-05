import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { CV } from './entities/cv.entity';
import { CvVersion } from './entities/cv-version.entity';
import { CvRendererService } from './services/cv-renderer.service';
import { JobsModule } from '../jobs/jobs.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { AIModule } from '../ai/ai.module';
import { CvRepository } from './cv.repository';
import { CvVersionRepository } from './cv-version.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([CV, CvVersion]),
    JobsModule,
    ProfilesModule,
    SubscriptionModule,
    AIModule,
  ],
  controllers: [CvController],
  providers: [CvService, CvRendererService, CvRepository, CvVersionRepository],
  exports: [CvService, CvRendererService, CvRepository],
})
export class CvModule {}
