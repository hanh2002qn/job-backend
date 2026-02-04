import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { Subscription } from './entities/subscription.entity';
import { StripeService } from './stripe.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription]), ConfigModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, StripeService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
