import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { AdminAiService } from '../services/admin-ai.service';
import { UpdateAiFeatureDto, ToggleAiFeatureDto } from '../dto/ai-feature.dto';

@ApiTags('Admin AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/ai')
export class AdminAiController {
  constructor(private readonly adminAiService: AdminAiService) {}

  // ============ Feature Config ============

  @Get('features')
  @ApiOperation({ summary: 'List all AI feature configs' })
  listFeatures() {
    return this.adminAiService.listFeatures();
  }

  @Get('features/:id')
  @ApiOperation({ summary: 'Get a single AI feature config' })
  getFeature(@Param('id') id: string) {
    return this.adminAiService.getFeature(id);
  }

  @Patch('features/:id')
  @ApiOperation({ summary: 'Update AI feature config' })
  updateFeature(@Param('id') id: string, @Body() dto: UpdateAiFeatureDto) {
    return this.adminAiService.updateFeature(id, dto);
  }

  @Patch('features/:id/toggle')
  @ApiOperation({ summary: 'Toggle AI feature enabled/disabled' })
  toggleFeature(@Param('id') id: string, @Body() dto: ToggleAiFeatureDto) {
    return this.adminAiService.toggleFeature(id, dto.isEnabled);
  }

  // ============ Usage Analytics ============

  @Get('usage')
  @ApiOperation({ summary: 'Get overall AI usage analytics' })
  getUsageStats() {
    return this.adminAiService.getOverallUsageStats();
  }

  @Get('usage/:featureKey')
  @ApiOperation({ summary: 'Get usage analytics for a specific AI feature' })
  getFeatureUsageStats(@Param('featureKey') featureKey: string) {
    return this.adminAiService.getFeatureUsageStats(featureKey);
  }
}
