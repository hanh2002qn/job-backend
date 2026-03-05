import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { AdminAiService } from '../services/admin-ai.service';

import {
  OverallUsageStatsResponseDto,
  FeatureUsageStatsResponseDto,
} from '../dto/ai-usage-stats.dto';

@ApiTags('Admin AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/ai')
export class AdminAiController {
  constructor(private readonly adminAiService: AdminAiService) {}

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
