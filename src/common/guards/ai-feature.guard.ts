import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AI_FEATURE_KEY } from '../decorators/ai-feature.decorator';
import { AdminAiService } from '../../modules/admin/services/admin-ai.service';
import { Request } from 'express';

/**
 * Guard that checks if an AI feature is enabled and enforces rate limits.
 *
 * Usage:
 * ```typescript
 * @UseGuards(AiFeatureGuard)
 * @AiFeature('cv_parsing')
 * ```
 */
@Injectable()
export class AiFeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private adminAiService: AdminAiService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const featureKey = this.reflector.getAllAndOverride<string | undefined>(AI_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no feature key is set, allow the request
    if (!featureKey) return true;

    const featureConfig = await this.adminAiService.getFeatureByKey(featureKey);

    // If feature not found in DB, allow by default (not yet configured)
    if (!featureConfig) return true;

    // Check if feature is enabled
    if (!featureConfig.isEnabled) {
      throw new ForbiddenException(
        `AI feature "${featureConfig.displayName}" is currently disabled by admin.`,
      );
    }

    // Check rate limit (0 = unlimited)
    if (featureConfig.maxRequestsPerDay > 0) {
      const request = context.switchToHttp().getRequest<Request>();
      const user = request.user as { id?: string } | undefined;
      const userId = user?.id;

      if (userId) {
        const dailyCount = await this.adminAiService.getUserDailyUsageCount(userId, featureKey);
        if (dailyCount >= featureConfig.maxRequestsPerDay) {
          throw new ForbiddenException(
            `Daily limit reached for "${featureConfig.displayName}" (${featureConfig.maxRequestsPerDay} requests/day).`,
          );
        }
      }
    }

    return true;
  }
}
