import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from './entities/subscription.entity';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { StripeService } from './stripe.service';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  async createCheckoutSession(
    userId: string,
    userEmail: string,
    createDto: CreateCheckoutSessionDto,
  ) {
    const priceIdKey =
      createDto.plan === SubscriptionPlan.PREMIUM_YEARLY
        ? 'STRIPE_PREMIUM_YEARLY_PRICE_ID'
        : 'STRIPE_PREMIUM_MONTHLY_PRICE_ID';

    const priceId = this.configService.get<string>(priceIdKey) || '';

    if (!priceId) {
      throw new BadRequestException('Invalid subscription plan or missing price ID');
    }

    const session = await this.stripeService.createCheckoutSession({
      userId,
      userEmail,
      priceId,
      successUrl: this.configService.get<string>('STRIPE_SUCCESS_URL') || '',
      cancelUrl: this.configService.get<string>('STRIPE_CANCEL_URL') || '',
      promoCode: createDto.promoCode,
    });

    return {
      sessionId: session.id,
      url: session.url as string,
    };
  }

  async handleWebhook(payload: any, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    let event: any;

    try {
      event = this.stripeService.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException('Webhook Error');
    }

    const session = event.data.object;

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(session);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(session);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(session);
        break;
      default:
        this.logger.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(session: any) {
    const userId = session.metadata.userId;
    const stripeSubscriptionId = session.subscription;
    const stripeCustomerId = session.customer;

    let sub = await this.subscriptionRepository.findOne({ where: { userId } });
    if (!sub) {
      sub = this.subscriptionRepository.create({ userId });
    }

    sub.stripeSubscriptionId = stripeSubscriptionId;
    sub.stripeCustomerId = stripeCustomerId;
    sub.status = SubscriptionStatus.ACTIVE;
    // Note: Plan mapping depends on priceId from session.line_items, but simplified for now
    sub.plan =
      session.amount_total > 5000
        ? SubscriptionPlan.PREMIUM_YEARLY
        : SubscriptionPlan.PREMIUM_MONTHLY;

    await this.subscriptionRepository.save(sub);
    this.logger.log(`Subscription activated for user ${userId}`);
  }

  private async handleSubscriptionUpdated(stripeSub: any) {
    const sub = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSub.id },
    });
    if (sub) {
      sub.status = stripeSub.status as SubscriptionStatus;
      sub.expiresAt = new Date(stripeSub.current_period_end * 1000);
      sub.cancelAtPeriodEnd = stripeSub.cancel_at_period_end;
      await this.subscriptionRepository.save(sub);
    }
  }

  private async handleSubscriptionDeleted(stripeSub: any) {
    const sub = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSub.id },
    });
    if (sub) {
      sub.status = SubscriptionStatus.CANCELED;
      sub.plan = SubscriptionPlan.FREE;
      await this.subscriptionRepository.save(sub);
    }
  }

  async cancelSubscription(userId: string) {
    const sub = await this.subscriptionRepository.findOne({ where: { userId } });
    if (!sub || !sub.stripeSubscriptionId) {
      throw new BadRequestException('No active subscription found');
    }

    // Cancel at period end via Stripe
    const stripeSub = await this.stripeService.cancelSubscription(sub.stripeSubscriptionId);

    sub.cancelAtPeriodEnd = stripeSub.cancel_at_period_end;
    sub.status = stripeSub.status as SubscriptionStatus;
    await this.subscriptionRepository.save(sub);

    return { message: 'Subscription will be canceled at the end of the current period', sub };
  }

  async getSubscription(userId: string) {
    return this.subscriptionRepository.findOne({ where: { userId } });
  }

  async isPremium(userId: string): Promise<boolean> {
    const sub = await this.getSubscription(userId);
    if (!sub) return false;

    return (
      (sub.plan === SubscriptionPlan.PREMIUM_MONTHLY ||
        sub.plan === SubscriptionPlan.PREMIUM_YEARLY) &&
      sub.status === SubscriptionStatus.ACTIVE &&
      (!sub.expiresAt || sub.expiresAt > new Date())
    );
  }
}
