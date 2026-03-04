import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { SettingsService } from '../../settings/settings.service';
import { UpdateSystemSettingDto } from '../../settings/dto/update-system-setting.dto';
import { AuditAction } from '../../../common/decorators/audit-log.decorator';

@ApiTags('Admin Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'List all system settings' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a single system setting' })
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Patch(':key')
  @AuditAction({ action: 'UPDATE_SETTING', module: 'SETTINGS' })
  @ApiOperation({ summary: 'Update or create a system setting' })
  update(@Param('key') key: string, @Body() updateDto: UpdateSystemSettingDto) {
    return this.settingsService.update(key, updateDto);
  }
}
