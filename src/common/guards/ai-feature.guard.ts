import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AI_FEATURE_KEY } from '../decorators/ai-feature.decorator';
import { AdminAiService } from '../../modules/admin/services/admin-ai.service';
import { Request } from 'express';
import { SubscriptionService } from '../../modules/subscription/subscription.service';
import { UserRole } from 'src/modules/users/entities/user.entity';

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
    private subscriptionService: SubscriptionService,
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

    // Determine quota based on tier or global default
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { id?: string; role?: string } | undefined;
    const userId = user?.id;

    if (!userId) return true;

    // Admin bypass
    if (user?.role === UserRole.ADMIN) return true;

    let quota = featureConfig.maxRequestsPerDay;

    // Check tier quotas
    if (featureConfig.tierQuotas) {
      const subscription = await this.subscriptionService.getSubscription(userId);
      const tier = subscription?.planSlug || 'free';
      if (featureConfig.tierQuotas[tier] !== undefined) {
        quota = featureConfig.tierQuotas[tier];
      }
    }

    // Check rate limit (0 = unlimited)
    if (quota > 0) {
      const dailyCount = await this.adminAiService.getUserDailyUsageCount(userId, featureKey);
      if (dailyCount >= quota) {
        throw new ForbiddenException(
          `Daily limit reached for "${featureConfig.displayName}" (${quota} requests/day).`,
        );
      }
    }

    return true;
  }
}
