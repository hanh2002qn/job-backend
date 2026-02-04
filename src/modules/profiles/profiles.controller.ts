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

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

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
        autoPopulate: { type: 'boolean', default: true },
      },
    },
  })
  @ApiQuery({ name: 'autoPopulate', required: false, type: Boolean })
  async uploadCv(
    @CurrentUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })], // 10MB
      }),
    )
    file: Express.Multer.File,
    @Query('autoPopulate') autoPopulate?: string,
  ) {
    const shouldAutoPopulate = autoPopulate !== 'false';
    return this.profilesService.uploadCv(user.id, file, shouldAutoPopulate);
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

  // ============ Public Routes ============

  @Get(':id')
  @ApiOperation({ summary: 'Get public profile (respects visibility settings)' })
  async getPublicProfile(@Param('id') id: string) {
    return this.profilesService.getPublicProfile(id);
  }
}
