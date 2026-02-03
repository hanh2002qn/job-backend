import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionPlan } from './entities/subscription.entity';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { StripeWebhookEvent } from './interfaces/stripe-webhook.interface';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  createCheckoutSession(userId: string, createDto: CreateCheckoutSessionDto) {
    // MOCK STRIPE CHECKOUT SESSION
    // In reality, call Stripe API here
    return {
      sessionId: 'mock_session_id_123',
      url: `https://mock-stripe-checkout.com/pay?plan=${createDto.plan}&user=${userId}`,
    };
  }

  handleWebhook(body: StripeWebhookEvent) {
    // MOCK STRIPE WEBHOOK HANDLER
    // Check signature, event type, etc.
    const { type, data } = body;

    if (type === 'checkout.session.completed') {
      const userId = data.object.metadata?.userId;

      // Update or create subscription
      // Implementation omitted for brevity in mock
      this.logger.log(`[MOCK WEBHOOK] Subscription activated for user ${userId}`);
    }

    return { received: true };
  }

  async getSubscription(userId: string) {
    return this.subscriptionRepository.findOne({ where: { userId } });
  }

  async isPremium(userId: string): Promise<boolean> {
    const sub = await this.getSubscription(userId);
    if (!sub) return false;

    // Check if plan is premium and not expired
    const now = new Date();
    return sub.plan === SubscriptionPlan.PREMIUM && (!sub.expiresAt || sub.expiresAt > now);
  }
}
