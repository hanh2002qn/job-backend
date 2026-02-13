import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiFeatureGuard } from '../../common/guards/ai-feature.guard';
import { AiFeature } from '../../common/decorators/ai-feature.decorator';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateVisibilityDto } from './dto/visibility-settings.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CompletenessQueryDto } from './dto/completeness-query.dto';
import { ProfileCompletenessService } from './services/profile-completeness.service';
import { CvImportSessionService } from './services/cv-import-session.service';
import { ProfileInsightsService } from './services/profile-insights.service';
import { FileUploadService } from '../../common/services/file-upload.service';
import { SkillsService } from './services/skills.service';
import { ExperienceService } from './services/experience.service';
import { ProjectsService } from './services/projects.service';
import { CareerIntentService } from './services/career-intent.service';
import { WorkPreferencesService } from './services/work-preferences.service';
import { CreateSkillDto, UpdateSkillDto, MergeSkillsDto } from './dto/skill.dto';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { UpdateCareerIntentDto } from './dto/career-intent.dto';
import { UpdateWorkPreferencesDto } from './dto/work-preferences.dto';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly completenessService: ProfileCompletenessService,
    private readonly cvImportService: CvImportSessionService,
    private readonly insightsService: ProfileInsightsService,
    private readonly fileUploadService: FileUploadService,
    private readonly skillsService: SkillsService,
    private readonly experienceService: ExperienceService,
    private readonly projectsService: ProjectsService,
    private readonly careerIntentService: CareerIntentService,
    private readonly workPreferencesService: WorkPreferencesService,
  ) {}

  // ============ Authenticated Routes ============

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile with completeness score' })
  async getMyProfile(@CurrentUser() user: User) {
    return this.profilesService.findByUserId(user.id);
  }

  @Put('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMyProfile(@CurrentUser() user: User, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.updateByUserId(user.id, updateProfileDto);
  }

  @Post('me/cv')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload CV and auto-populate profile with AI parsing' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadCv(
    @CurrentUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })], // 10MB
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.profilesService.uploadCv(user.id, file);
  }

  @Post('me/avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload profile avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })], // 5MB
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.profilesService.uploadAvatar(user.id, file);
  }

  @Put('me/visibility')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update profile visibility settings' })
  async updateVisibility(@CurrentUser() user: User, @Body() dto: UpdateVisibilityDto) {
    return this.profilesService.updateVisibility(user.id, dto);
  }

  @Get('me/completeness')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AiFeatureGuard)
  @AiFeature('profile_completeness')
  @ApiOperation({ summary: 'Get profile completeness score for target role' })
  async getCompleteness(@CurrentUser() user: User, @Query() query: CompletenessQueryDto) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const targetRole = query.targetRole || 'general';
    return this.completenessService.calculateCompleteness(profile.id, targetRole);
  }

  @Get('me/cv/sessions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get CV import sessions for current user' })
  async getCvSessions(@CurrentUser() user: User) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.cvImportService.findByProfileId(profile.id);
  }

  @Post('me/cv/confirm/:sessionId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Confirm CV import session and merge to profile' })
  async confirmCvImport(@CurrentUser() user: User, @Param('sessionId') sessionId: string) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.cvImportService.confirm(profile.id, sessionId);
  }

  @Post('me/cv/discard/:sessionId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Discard CV import session' })
  async discardCvImport(@CurrentUser() user: User, @Param('sessionId') sessionId: string) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    await this.cvImportService.discard(profile.id, sessionId);
    return { message: 'Session discarded successfully' };
  }

  @Get('me/insights')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AiFeatureGuard)
  @AiFeature('profile_insights')
  @ApiOperation({ summary: 'Get AI insights for current user profile' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  async getInsights(@CurrentUser() user: User, @Query('unreadOnly') unreadOnly?: string) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const isUnreadOnly = unreadOnly === 'true';
    return this.insightsService.getInsights(profile.id, isUnreadOnly);
  }

  @Post('me/insights/:insightId/read')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark insight as read' })
  async markInsightAsRead(@CurrentUser() user: User, @Param('insightId') insightId: string) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.insightsService.markAsRead(profile.id, insightId);
  }

  @Post('me/insights/:insightId/actioned')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark insight as actioned' })
  async markInsightAsActioned(@CurrentUser() user: User, @Param('insightId') insightId: string) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.insightsService.markAsActioned(profile.id, insightId);
  }

  // ============ Skills CRUD ============

  @Get('me/skills')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all skills for current user' })
  async getSkills(@CurrentUser() user: User) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.skillsService.findAll(profile.id);
  }

  @Post('me/skills')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a new skill' })
  async createSkill(@CurrentUser() user: User, @Body() dto: CreateSkillDto) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.skillsService.create(profile.id, dto);
  }

  @Put('me/skills/:skillId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a skill' })
  async updateSkill(
    @CurrentUser() user: User,
    @Param('skillId') skillId: string,
    @Body() dto: UpdateSkillDto,
  ) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.skillsService.update(profile.id, skillId, dto);
  }

  @Delete('me/skills/:skillId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a skill' })
  async deleteSkill(@CurrentUser() user: User, @Param('skillId') skillId: string) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    await this.skillsService.remove(profile.id, skillId);
    return { message: 'Skill deleted successfully' };
  }

  @Post('me/skills/merge')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Merge duplicate skills' })
  async mergeSkills(@CurrentUser() user: User, @Body() dto: MergeSkillsDto) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.skillsService.merge(profile.id, dto);
  }

  // ============ Experience CRUD ============

  @Get('me/experiences')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all experiences for current user' })
  async getExperiences(@CurrentUser() user: User) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.experienceService.findAll(profile.id);
  }

  @Post('me/experiences')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a new experience' })
  async createExperience(@CurrentUser() user: User, @Body() dto: CreateExperienceDto) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.experienceService.create(profile.id, dto);
  }

  @Put('me/experiences/:experienceId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an experience' })
  async updateExperience(
    @CurrentUser() user: User,
    @Param('experienceId') experienceId: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.experienceService.update(profile.id, experienceId, dto);
  }

  @Delete('me/experiences/:experienceId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete an experience' })
  async deleteExperience(@CurrentUser() user: User, @Param('experienceId') experienceId: string) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    await this.experienceService.remove(profile.id, experienceId);
    return { message: 'Experience deleted successfully' };
  }

  // ============ Projects CRUD ============

  @Get('me/projects')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all projects for current user' })
  async getProjects(@CurrentUser() user: User) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.projectsService.findAll(profile.id);
  }

  @Post('me/projects')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a new project' })
  async createProject(@CurrentUser() user: User, @Body() dto: CreateProjectDto) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.projectsService.create(profile.id, dto);
  }

  @Put('me/projects/:projectId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a project' })
  async updateProject(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.projectsService.update(profile.id, projectId, dto);
  }

  @Delete('me/projects/:projectId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a project' })
  async deleteProject(@CurrentUser() user: User, @Param('projectId') projectId: string) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    await this.projectsService.remove(profile.id, projectId);
    return { message: 'Project deleted successfully' };
  }

  // ============ Career Intent ============

  @Get('me/career-intent')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get career intent for current user' })
  async getCareerIntent(@CurrentUser() user: User) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.careerIntentService.findByProfileId(profile.id);
  }

  @Put('me/career-intent')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update career intent' })
  async updateCareerIntent(@CurrentUser() user: User, @Body() dto: UpdateCareerIntentDto) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.careerIntentService.upsert(profile.id, dto);
  }

  // ============ Work Preferences ============

  @Get('me/work-preferences')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get work preferences for current user' })
  async getWorkPreferences(@CurrentUser() user: User) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.workPreferencesService.findByProfileId(profile.id);
  }

  @Put('me/work-preferences')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update work preferences' })
  async updateWorkPreferences(@CurrentUser() user: User, @Body() dto: UpdateWorkPreferencesDto) {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.workPreferencesService.upsert(profile.id, dto);
  }

  // ============ Public Routes ============

  @Get(':id')
  @ApiOperation({ summary: 'Get public profile by ID' })
  @ApiParam({ name: 'id', description: 'Profile ID (UUID)' })
  async getPublicProfile(@Param('id') id: string) {
    const profile = await this.profilesService.findPublicProfile(id);
    if (!profile) {
      throw new NotFoundException('Profile not found or is not public');
    }
    return profile;
  }
}
