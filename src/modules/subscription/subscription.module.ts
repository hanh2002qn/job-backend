import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { Subscription } from './entities/subscription.entity';
import { Plan } from './entities/plan.entity';
import { UserCredits } from '../users/entities/user-credits.entity';
import { StripeService } from './stripe.service';
import { SubscriptionRepository } from './subscription.repository';
import { PlanRepository } from './plan.repository';
import { UserCreditsRepository } from '../users/user-credits.repository';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Subscription, UserCredits, Plan]), ConfigModule],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    StripeService,
    SubscriptionRepository,
    PlanRepository,
    UserCreditsRepository,
  ],
  exports: [SubscriptionService, StripeService, SubscriptionRepository, PlanRepository],
})
export class SubscriptionModule {}
