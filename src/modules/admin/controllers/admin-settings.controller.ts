import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { SettingsService } from '../../settings/settings.service';
import { UpdateSystemSettingDto } from '../../settings/dto/update-system-setting.dto';
import { AuditAction } from '../../../common/decorators/audit-log.decorator';
import { SystemSetting } from '../../settings/entities/system-setting.entity';

@ApiTags('Admin Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'List all system settings' })
  @ApiResponse({ status: 200, description: 'Settings returned.', type: [SystemSetting] })
  findAll(): Promise<SystemSetting[]> {
    return this.settingsService.findAll();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a single system setting' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiResponse({ status: 200, description: 'Setting returned.', type: SystemSetting })
  @ApiResponse({ status: 404, description: 'Setting not found.' })
  findOne(@Param('key') key: string): Promise<SystemSetting> {
    return this.settingsService.findOne(key);
  }

  @Patch(':key')
  @AuditAction({ action: 'UPDATE_SETTING', module: 'SETTINGS' })
  @ApiOperation({ summary: 'Update or create a system setting' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiResponse({ status: 200, description: 'Setting updated.', type: SystemSetting })
  update(
    @Param('key') key: string,
    @Body() updateDto: UpdateSystemSettingDto,
  ): Promise<SystemSetting> {
    return this.settingsService.update(key, updateDto);
  }
}
