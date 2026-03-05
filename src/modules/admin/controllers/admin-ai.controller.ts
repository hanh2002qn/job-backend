import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { AdminAiService } from '../services/admin-ai.service';
import { UpdateAiFeatureDto, ToggleAiFeatureDto } from '../dto/ai-feature.dto';
import {
  OverallUsageStatsResponseDto,
  FeatureUsageStatsResponseDto,
} from '../dto/ai-usage-stats.dto';
import {
  AuditAction,
  AuditActionType,
  AuditModule,
} from '../../../common/decorators/audit-log.decorator';

import { AiFeatureConfig } from '../../ai/entities/ai-feature-config.entity';

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
  @ApiResponse({
    status: 200,
    description: 'AI feature configs returned.',
    type: [AiFeatureConfig],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  listFeatures(): Promise<AiFeatureConfig[]> {
    return this.adminAiService.listFeatures();
  }

  @Get('features/:id')
  @ApiOperation({ summary: 'Get a single AI feature config' })
  @ApiParam({ name: 'id', description: 'AI feature config ID (UUID)' })
  @ApiResponse({ status: 200, description: 'AI feature config returned.', type: AiFeatureConfig })
  @ApiResponse({ status: 404, description: 'Feature not found.' })
  getFeature(@Param('id') id: string): Promise<AiFeatureConfig> {
    return this.adminAiService.getFeature(id);
  }

  @Patch('features/:id')
  @AuditAction({ action: AuditActionType.UPDATE_AI_FEATURE, module: AuditModule.AI_CONFIG })
  @ApiOperation({ summary: 'Update AI feature config' })
  @ApiParam({ name: 'id', description: 'AI feature config ID (UUID)' })
  @ApiResponse({ status: 200, description: 'AI feature config updated.', type: AiFeatureConfig })
  @ApiResponse({ status: 404, description: 'Feature not found.' })
  updateFeature(
    @Param('id') id: string,
    @Body() dto: UpdateAiFeatureDto,
  ): Promise<AiFeatureConfig> {
    return this.adminAiService.updateFeature(id, dto);
  }

  @Patch('features/:id/toggle')
  @AuditAction({ action: AuditActionType.TOGGLE_AI_FEATURE, module: AuditModule.AI_CONFIG })
  @ApiOperation({ summary: 'Toggle AI feature enabled/disabled' })
  @ApiParam({ name: 'id', description: 'AI feature config ID (UUID)' })
  @ApiResponse({ status: 200, description: 'AI feature toggled.', type: AiFeatureConfig })
  @ApiResponse({ status: 404, description: 'Feature not found.' })
  toggleFeature(
    @Param('id') id: string,
    @Body() dto: ToggleAiFeatureDto,
  ): Promise<AiFeatureConfig> {
    return this.adminAiService.toggleFeature(id, dto.isEnabled);
  }

  // ============ Usage Analytics ============

  @Get('usage')
  @ApiOperation({ summary: 'Get overall AI usage analytics' })
  @ApiResponse({
    status: 200,
    description: 'Overall usage stats returned.',
    type: OverallUsageStatsResponseDto,
  })
  getUsageStats(): Promise<OverallUsageStatsResponseDto> {
    return this.adminAiService.getOverallUsageStats();
  }

  @Get('usage/:featureKey')
  @ApiOperation({ summary: 'Get usage analytics for a specific AI feature' })
  @ApiParam({ name: 'featureKey', description: 'AI feature key (e.g., cv_generation)' })
  @ApiResponse({
    status: 200,
    description: 'Feature usage stats returned.',
    type: FeatureUsageStatsResponseDto,
  })
  getFeatureUsageStats(
    @Param('featureKey') featureKey: string,
  ): Promise<FeatureUsageStatsResponseDto> {
    return this.adminAiService.getFeatureUsageStats(featureKey);
  }
}
