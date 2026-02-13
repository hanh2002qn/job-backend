import {
  Controller,
  Get,
  Put,
  Post,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
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

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly completenessService: ProfileCompletenessService,
    private readonly cvImportService: CvImportSessionService,
    private readonly insightsService: ProfileInsightsService,
    private readonly fileUploadService: FileUploadService,
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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

  // ============ Public Routes ============

  @Get(':id')
  @ApiOperation({ summary: 'Get public profile (respects visibility settings)' })
  async getPublicProfile(@Param('id') id: string) {
    return this.profilesService.getPublicProfile(id);
  }
}
