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
import { ProfileRepository } from './profile.repository';
import { ProfileSkillRepository } from './profile-skill.repository';
import { ProfileExperienceRepository } from './profile-experience.repository';
import { ProfileProjectRepository } from './profile-project.repository';
import { WorkPreferencesRepository } from './work-preferences.repository';
import { CareerIntentRepository } from './career-intent.repository';
import { ProfileMetadataRepository } from './profile-metadata.repository';
import { ProfileInsightRepository } from './profile-insight.repository';
import { CvImportSessionRepository } from './cv-import-session.repository';

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
    ProfileRepository,
    ProfileSkillRepository,
    ProfileExperienceRepository,
    ProfileProjectRepository,
    WorkPreferencesRepository,
    CareerIntentRepository,
    ProfileMetadataRepository,
    ProfileInsightRepository,
    CvImportSessionRepository,
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
    ProfileRepository,
    ProfileSkillRepository,
    ProfileExperienceRepository,
    ProfileProjectRepository,
    WorkPreferencesRepository,
    CareerIntentRepository,
    ProfileMetadataRepository,
    ProfileInsightRepository,
    CvImportSessionRepository,
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
