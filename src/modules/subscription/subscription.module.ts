import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { Subscription } from './entities/subscription.entity';
import { Plan } from './entities/plan.entity';
import { StripeService } from './stripe.service';
import { SubscriptionRepository } from './subscription.repository';
import { PlanRepository } from './plan.repository';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Subscription, Plan]), ConfigModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, StripeService, SubscriptionRepository, PlanRepository],
  exports: [SubscriptionService, StripeService, SubscriptionRepository, PlanRepository],
})
export class SubscriptionModule {}
