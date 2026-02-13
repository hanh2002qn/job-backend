import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import {
  Profile,
  ProfileSkill,
  ProfileExperience,
  ProfileProject,
  CareerIntent,
  WorkPreferences,
  CvImportSession,
  ProfileMetadata,
  ProfileInsight,
} from './entities';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { SkillsService } from './services/skills.service';
import { ExperienceService } from './services/experience.service';
import { ProjectsService } from './services/projects.service';
import { CareerIntentService } from './services/career-intent.service';
import { WorkPreferencesService } from './services/work-preferences.service';
import { CvImportSessionService } from './services/cv-import-session.service';
import { ProfileCompletenessService } from './services/profile-completeness.service';
import { ProfileInsightsService } from './services/profile-insights.service';
import { FileUploadModule } from '../../common/services/file-upload.module';
import { AIModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
      ProfileSkill,
      ProfileExperience,
      ProfileProject,
      CareerIntent,
      WorkPreferences,
      CvImportSession,
      ProfileMetadata,
      ProfileInsight,
    ]),
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
    FileUploadModule,
    AIModule,
    UsersModule,
  ],
  controllers: [ProfilesController],
  providers: [
    ProfilesService,
    SkillsService,
    ExperienceService,
    ProjectsService,
    CareerIntentService,
    WorkPreferencesService,
    CvImportSessionService,
    ProfileCompletenessService,
    ProfileInsightsService,
  ],
  exports: [
    ProfilesService,
    SkillsService,
    ExperienceService,
    ProjectsService,
    CareerIntentService,
    WorkPreferencesService,
    CvImportSessionService,
    ProfileCompletenessService,
    ProfileInsightsService,
  ],
})
export class ProfilesModule {}
