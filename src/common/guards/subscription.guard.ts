import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';
import { SubscriptionService } from '../../modules/subscription/subscription.service';
import { SubscriptionPlan } from '../../modules/subscription/entities/subscription.entity';
import { CvService } from '../../modules/cv/cv.service';
import { User } from '../../modules/users/entities/user.entity';

interface AuthenticatedRequest extends ExpressRequest {
  user?: User;
}

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private subscriptionService: SubscriptionService,
    private cvService: CvService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) return false;

    // 1. Get Subscription
    const subscription = await this.subscriptionService.getSubscription(
      user.id,
    );
    const plan = subscription?.plan || SubscriptionPlan.FREE;

    // If Premium, allow everything
    if (plan === SubscriptionPlan.PREMIUM) return true;

    // 2. Check Limits for Free Plan
    // Example: Limit CVs to 2
    if (request.path.includes('/cv/generate')) {
      const cvs = await this.cvService.findAll(user.id);
      if (cvs.length >= 2) {
        throw new ForbiddenException(
          'Free plan is limited to 2 CVs. Upgrade to Premium to generate more.',
        );
      }
    }

    return true;
  }
}
