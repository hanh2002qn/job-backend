import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionService } from '../../modules/subscription/subscription.service';
import { AuthenticatedRequest } from '../interfaces';
import { CHECK_LIMIT_KEY } from '../decorators/subscription.decorator';
import { PlanLimits } from '../../modules/subscription/entities/plan.entity';
import { SubscriptionStatus } from '../../modules/subscription/entities/subscription.entity';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private subscriptionService: SubscriptionService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) return false;

    // 1. Get Subscription with Plan Details
    const subscription = await this.subscriptionService.getSubscription(user.id);
    if (!subscription) {
      throw new NotFoundException('Subscription not found. Please contact support.');
    }

    // Attach to request for service use
    request.subscription = subscription;

    // 3. Status Check (Already done in Broad Status Check, kept for clarity)
    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new ForbiddenException(
        'Your subscription is not active. Please check your payment status.',
      );
    }

    // 4. Limit Check (Metadata-driven)
    const limitField = this.reflector.get<keyof PlanLimits>(CHECK_LIMIT_KEY, context.getHandler());

    if (limitField) {
      const plan = subscription.planDetails;
      const limits = plan?.limits || {
        max_cvs: 2,
        max_cover_letters: 2,
        max_follow_ups: 1,
        cv_templates: ['free'],
      };

      const limitValue = limits[limitField];
      if (typeof limitValue === 'number' && limitValue < 9999) {
        const usageField = this.mapLimitToUsage(limitField);
        const currentUsage = (subscription[usageField as keyof typeof subscription] as number) || 0;

        if (currentUsage >= limitValue) {
          throw new ForbiddenException(
            `You have reached your limit for this feature (${limitValue}/${limitValue}). Please upgrade for more.`,
          );
        }
      }
    }

    return true;
  }

  private mapLimitToUsage(limitField: keyof PlanLimits): string {
    const map: Record<string, string> = {
      max_cvs: 'cvUsage',
      max_cover_letters: 'coverLetterUsage',
      max_follow_ups: 'followUpUsage',
      max_tracked_jobs: 'trackedJobsUsage',
    };
    return map[limitField] || '';
  }
}
