import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY') || '';
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion, // Use specific version literal
    });
  }

  async createCheckoutSession(params: {
    userId: string;
    userEmail: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    promoCode?: string;
    metadata?: Record<string, string>;
  }) {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.userEmail,
      metadata: {
        userId: params.userId,
        ...params.metadata,
      },
      allow_promotion_codes: true, // Allow manually entered codes
      // If a specific promo code is provided, we'd need to handle it via discounts
      // but Stripe Checkout Handles it via 'allow_promotion_codes' mostly.
    });
  }

  async cancelSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  constructEvent(payload: string | Buffer, signature: string, secret: string) {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }

  async listTransactions(limit = 100) {
    return this.stripe.charges.list({ limit });
  }

  async listCoupons(limit = 100) {
    return this.stripe.coupons.list({ limit });
  }

  async createCoupon(params: Stripe.CouponCreateParams) {
    return this.stripe.coupons.create(params);
  }

  async deleteCoupon(couponId: string) {
    return this.stripe.coupons.del(couponId);
  }
}
