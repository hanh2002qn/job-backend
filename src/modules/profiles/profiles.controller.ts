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
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateVisibilityDto } from './dto/visibility-settings.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CompletenessQueryDto } from './dto/completeness-query.dto';
import {
  ProfileCompletenessService,
  CompletenessResult,
} from './services/profile-completeness.service';
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
import { Profile } from './entities/profile.entity';
import { CvImportSession } from './entities/cv-import-session.entity';
import { ProfileInsight } from './entities/profile-insight.entity';
import { ProfileSkill } from './entities/profile-skill.entity';
import { ProfileExperience } from './entities/profile-experience.entity';
import { ProfileProject } from './entities/profile-project.entity';
import { CareerIntent } from './entities/career-intent.entity';
import { WorkPreferences } from './entities/work-preferences.entity';

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
  @ApiResponse({ status: 200, description: 'Profile returned.', type: Profile })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMyProfile(@CurrentUser() user: User): Promise<Profile | null> {
    return this.profilesService.findByUserId(user.id);
  }

  @Put('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated.', type: Profile })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateMyProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    return this.profilesService.updateByUserId(user.id, updateProfileDto);
  }

  @Post('me/cv')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload CV and auto-populate profile with AI parsing' })
  @ApiResponse({ status: 201, description: 'CV uploaded and parsed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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
  ): Promise<{ url: string; session?: CvImportSession; parseError?: string }> {
    return this.profilesService.uploadCv(user.id, file);
  }

  @Post('me/avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload profile avatar' })
  @ApiResponse({ status: 201, description: 'Avatar uploaded.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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
  ): Promise<{ url: string }> {
    return this.profilesService.uploadAvatar(user.id, file);
  }

  @Put('me/visibility')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update profile visibility settings' })
  @ApiResponse({ status: 200, description: 'Visibility settings updated.', type: Profile })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateVisibility(
    @CurrentUser() user: User,
    @Body() dto: UpdateVisibilityDto,
  ): Promise<Profile> {
    return this.profilesService.updateVisibility(user.id, dto);
  }

  @Get('me/completeness')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get profile completeness score for target role' })
  @ApiResponse({ status: 200, description: 'Completeness score returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  async getCompleteness(
    @CurrentUser() user: User,
    @Query() query: CompletenessQueryDto,
  ): Promise<CompletenessResult> {
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
  @ApiResponse({
    status: 200,
    description: 'CV import sessions returned.',
    type: [CvImportSession],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  async getCvSessions(@CurrentUser() user: User): Promise<CvImportSession[]> {
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
  @ApiParam({ name: 'sessionId', description: 'CV import session ID (UUID)' })
  @ApiResponse({ status: 201, description: 'CV import confirmed and merged.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Profile or session not found.' })
  async confirmCvImport(
    @CurrentUser() user: User,
    @Param('sessionId') sessionId: string,
  ): Promise<{ skills: number; experiences: number; projects: number }> {
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
  @ApiParam({ name: 'sessionId', description: 'CV import session ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Session discarded.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Profile or session not found.' })
  async discardCvImport(
    @CurrentUser() user: User,
    @Param('sessionId') sessionId: string,
  ): Promise<{ message: string }> {
    const profile = await this.profilesService.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    await this.cvImportService.discard(profile.id, sessionId);
    return { message: 'Session discarded successfully' };
  }

  @Get('me/insights')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get AI insights for current user profile' })
  @ApiResponse({ status: 200, description: 'Profile insights returned.', type: [ProfileInsight] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  async getInsights(
    @CurrentUser() user: User,
    @Query('unreadOnly') unreadOnly?: string,
  ): Promise<ProfileInsight[]> {
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
  @ApiParam({ name: 'insightId', description: 'Insight ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Insight marked as read.', type: ProfileInsight })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Profile or insight not found.' })
  async markInsightAsRead(
    @CurrentUser() user: User,
    @Param('insightId') insightId: string,
  ): Promise<ProfileInsight> {
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
  @ApiParam({ name: 'insightId', description: 'Insight ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Insight marked as actioned.', type: ProfileInsight })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Profile or insight not found.' })
  async markInsightAsActioned(
    @CurrentUser() user: User,
    @Param('insightId') insightId: string,
  ): Promise<ProfileInsight> {
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
  @ApiResponse({ status: 200, description: 'Skills returned.', type: [ProfileSkill] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getSkills(@CurrentUser() user: User): Promise<ProfileSkill[]> {
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
  @ApiResponse({ status: 201, description: 'Skill created.', type: ProfileSkill })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createSkill(@CurrentUser() user: User, @Body() dto: CreateSkillDto): Promise<ProfileSkill> {
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
  @ApiParam({ name: 'skillId', description: 'Skill ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Skill updated.', type: ProfileSkill })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateSkill(
    @CurrentUser() user: User,
    @Param('skillId') skillId: string,
    @Body() dto: UpdateSkillDto,
  ): Promise<ProfileSkill> {
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
  @ApiParam({ name: 'skillId', description: 'Skill ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Skill deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async deleteSkill(
    @CurrentUser() user: User,
    @Param('skillId') skillId: string,
  ): Promise<{ message: string }> {
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
  @ApiResponse({ status: 201, description: 'Skills merged.', type: ProfileSkill })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async mergeSkills(@CurrentUser() user: User, @Body() dto: MergeSkillsDto): Promise<ProfileSkill> {
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
  @ApiResponse({ status: 200, description: 'Experiences returned.', type: [ProfileExperience] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getExperiences(@CurrentUser() user: User): Promise<ProfileExperience[]> {
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
  @ApiResponse({ status: 201, description: 'Experience created.', type: ProfileExperience })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createExperience(
    @CurrentUser() user: User,
    @Body() dto: CreateExperienceDto,
  ): Promise<ProfileExperience> {
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
  @ApiParam({ name: 'experienceId', description: 'Experience ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Experience updated.', type: ProfileExperience })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateExperience(
    @CurrentUser() user: User,
    @Param('experienceId') experienceId: string,
    @Body() dto: UpdateExperienceDto,
  ): Promise<ProfileExperience> {
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
  @ApiParam({ name: 'experienceId', description: 'Experience ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Experience deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async deleteExperience(
    @CurrentUser() user: User,
    @Param('experienceId') experienceId: string,
  ): Promise<{ message: string }> {
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
  @ApiResponse({ status: 200, description: 'Projects returned.', type: [ProfileProject] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProjects(@CurrentUser() user: User): Promise<ProfileProject[]> {
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
  @ApiResponse({ status: 201, description: 'Project created.', type: ProfileProject })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createProject(
    @CurrentUser() user: User,
    @Body() dto: CreateProjectDto,
  ): Promise<ProfileProject> {
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
  @ApiParam({ name: 'projectId', description: 'Project ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Project updated.', type: ProfileProject })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateProject(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProfileProject> {
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
  @ApiParam({ name: 'projectId', description: 'Project ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Project deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async deleteProject(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
  ): Promise<{ message: string }> {
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
  @ApiResponse({ status: 200, description: 'Career intent returned.', type: CareerIntent })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getCareerIntent(@CurrentUser() user: User): Promise<CareerIntent | null> {
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
  @ApiResponse({ status: 200, description: 'Career intent updated.', type: CareerIntent })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateCareerIntent(
    @CurrentUser() user: User,
    @Body() dto: UpdateCareerIntentDto,
  ): Promise<CareerIntent> {
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
  @ApiResponse({ status: 200, description: 'Work preferences returned.', type: WorkPreferences })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getWorkPreferences(@CurrentUser() user: User): Promise<WorkPreferences | null> {
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
  @ApiResponse({ status: 200, description: 'Work preferences updated.', type: WorkPreferences })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateWorkPreferences(
    @CurrentUser() user: User,
    @Body() dto: UpdateWorkPreferencesDto,
  ): Promise<WorkPreferences> {
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
  @ApiResponse({ status: 200, description: 'Public profile returned.' })
  @ApiResponse({ status: 404, description: 'Profile not found or is not public.' })
  async getPublicProfile(@Param('id') id: string): Promise<Partial<Profile>> {
    const profile = await this.profilesService.findPublicProfile(id);
    if (!profile) {
      throw new NotFoundException('Profile not found or is not public');
    }
    return profile;
  }
}
