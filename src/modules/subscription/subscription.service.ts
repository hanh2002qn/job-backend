import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  Subscription as SubscriptionEntity,
  SubscriptionPlan,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { Plan } from './entities/plan.entity';
import { UserCredits } from '../users/entities/user-credits.entity';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';

interface StripeSubscriptionEvent {
  id: string;
  status: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(SubscriptionEntity)
    private subscriptionRepository: Repository<SubscriptionEntity>,
    @InjectRepository(UserCredits)
    private creditsRepository: Repository<UserCredits>,
    @InjectRepository(Plan) // Injected Plan repository
    private planRepository: Repository<Plan>,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  async createCheckoutSession(
    userId: string,
    userEmail: string,
    createDto: CreateCheckoutSessionDto,
  ) {
    // Lookup plan by slug (enum value)
    const plan = await this.planRepository.findOne({ where: { slug: createDto.plan } });
    if (!plan) {
      throw new BadRequestException('Invalid subscription plan');
    }

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
      metadata: { userId, planId: plan.id, planSlug: plan.slug }, // Store plan info in metadata
    });

    return {
      sessionId: session.id,
      url: session.url as string,
    };
  }

  async handleWebhook(payload: Buffer | string, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    let event: Stripe.Event;

    try {
      event = this.stripeService.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Webhook signature verification failed: ${message}`);
      throw new BadRequestException('Webhook Error');
    }

    const session = event.data.object;

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(session as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(session as unknown as StripeSubscriptionEvent);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(session as unknown as StripeSubscriptionEvent);
        break;
      default:
        this.logger.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    const stripeSubscriptionId = session.subscription as string;
    const stripeCustomerId = session.customer as string;

    if (!userId) {
      this.logger.error('No userId found in session metadata');
      return;
    }

    let sub = await this.subscriptionRepository.findOne({ where: { userId } });
    if (!sub) {
      sub = this.subscriptionRepository.create({ userId });
    }

    const plan = await this.planRepository.findOne({ where: { id: planId } });
    if (!plan) {
      this.logger.error(`Plan not found for id: ${planId}`);
      // Fallback or error handling? For now, we proceed but might have issues
    }

    sub.stripeSubscriptionId = stripeSubscriptionId;
    sub.stripeCustomerId = stripeCustomerId;
    sub.status = SubscriptionStatus.ACTIVE;
    sub.planId = plan?.id || null; // Save relation

    // Legacy support: keep enum for now if needed, or derived from plan slug
    if (plan) {
      sub.plan = plan.slug as SubscriptionPlan;
    }

    await this.subscriptionRepository.save(sub);

    // Refill credits based on Plan Limits
    let credits = await this.creditsRepository.findOne({ where: { userId } });
    if (!credits) {
      credits = this.creditsRepository.create({ userId });
    }

    // Dynamic Refill
    const monthlyCredits = plan?.limits?.monthly_credits || 0;
    credits.balance = monthlyCredits;
    credits.lastRefillDate = new Date();
    await this.creditsRepository.save(credits);

    this.logger.log(
      `Subscription activated and credits refilled for user ${userId} with ${monthlyCredits} credits`,
    );
  }

  private async handleSubscriptionUpdated(stripeSub: StripeSubscriptionEvent) {
    const sub = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSub.id },
    });
    if (sub) {
      sub.status = stripeSub.status as unknown as SubscriptionStatus;
      sub.expiresAt = new Date(stripeSub.current_period_end * 1000);
      sub.cancelAtPeriodEnd = stripeSub.cancel_at_period_end;
      await this.subscriptionRepository.save(sub);
    }
  }

  private async handleSubscriptionDeleted(stripeSub: StripeSubscriptionEvent) {
    const sub = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSub.id },
    });
    if (sub) {
      sub.status = SubscriptionStatus.CANCELED;
      // Reset to Free Plan
      const freePlan = await this.planRepository.findOne({
        where: { slug: SubscriptionPlan.FREE },
      });
      sub.planId = freePlan?.id || null;
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

  async getSubscription(userId: string): Promise<SubscriptionEntity | null> {
    return this.subscriptionRepository.findOne({
      where: { userId },
      relations: ['planDetails'],
    });
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
