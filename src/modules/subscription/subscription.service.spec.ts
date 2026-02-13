import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from './subscription.service';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Subscription as SubscriptionEntity,
  SubscriptionPlan,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { Plan } from './entities/plan.entity';
import { UserCredits } from '../users/entities/user-credits.entity';
import { BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';

const mockSubscriptionRepository = {
  findOne: jest.fn(),
  create: jest.fn().mockImplementation((data) => ({ ...data })),
  save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'sub-uuid', ...data })),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
};

const mockCreditsRepository = {
  findOne: jest.fn(),
  create: jest.fn().mockImplementation((data) => ({ ...data })),
  save: jest.fn().mockResolvedValue(undefined),
};

const mockPlanRepository = {
  findOne: jest.fn(),
};

const mockStripeService = {
  createCheckoutSession: jest.fn(),
  constructEvent: jest.fn(),
  cancelSubscription: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      STRIPE_PREMIUM_MONTHLY_PRICE_ID: 'price_monthly_123',
      STRIPE_PREMIUM_YEARLY_PRICE_ID: 'price_yearly_456',
      STRIPE_WEBHOOK_SECRET: 'whsec_test',
      STRIPE_SUCCESS_URL: 'https://app.com/success',
      STRIPE_CANCEL_URL: 'https://app.com/cancel',
    };
    return config[key] || '';
  }),
};

const mockPlan = {
  id: 'plan-uuid-1',
  slug: SubscriptionPlan.PREMIUM_MONTHLY,
  name: 'Premium Monthly',
  limits: { monthly_credits: 100 },
};

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: getRepositoryToken(SubscriptionEntity), useValue: mockSubscriptionRepository },
        { provide: getRepositoryToken(UserCredits), useValue: mockCreditsRepository },
        { provide: getRepositoryToken(Plan), useValue: mockPlanRepository },
        { provide: StripeService, useValue: mockStripeService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── createCheckoutSession ───────────────────────────────────
  describe('createCheckoutSession', () => {
    it('should create a Stripe checkout session for a valid plan', async () => {
      mockPlanRepository.findOne.mockResolvedValue(mockPlan);
      mockStripeService.createCheckoutSession.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/session',
      });

      const result = await service.createCheckoutSession('user-1', 'user@test.com', {
        plan: SubscriptionPlan.PREMIUM_MONTHLY,
      });

      expect(result).toEqual({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/session',
      });
      expect(mockStripeService.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          userEmail: 'user@test.com',
          priceId: 'price_monthly_123',
        }),
      );
    });

    it('should throw BadRequestException for invalid plan', async () => {
      mockPlanRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createCheckoutSession('user-1', 'user@test.com', {
          plan: 'invalid_plan' as SubscriptionPlan,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── handleWebhook ───────────────────────────────────────────
  describe('handleWebhook', () => {
    it('should handle checkout.session.completed event', async () => {
      const mockSession = {
        metadata: { userId: 'user-1', planId: 'plan-uuid-1' },
        subscription: 'sub_stripe_123',
        customer: 'cus_stripe_456',
      } as unknown as Stripe.Checkout.Session;

      mockStripeService.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: mockSession },
      });

      mockSubscriptionRepository.findOne.mockResolvedValue(null);
      mockPlanRepository.findOne.mockResolvedValue(mockPlan);
      mockCreditsRepository.findOne.mockResolvedValue(null);

      const result = await service.handleWebhook('payload', 'sig_header');

      expect(result).toEqual({ received: true });
      expect(mockSubscriptionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          stripeSubscriptionId: 'sub_stripe_123',
          status: SubscriptionStatus.ACTIVE,
        }),
      );
      expect(mockCreditsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          balance: 100, // from mockPlan.limits.monthly_credits
        }),
      );
    });

    it('should throw on invalid webhook signature', async () => {
      mockStripeService.constructEvent.mockImplementation(() => {
        throw new Error('Signature verification failed');
      });

      await expect(service.handleWebhook('bad_payload', 'bad_sig')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle customer.subscription.updated event', async () => {
      const mockStripeSub = {
        id: 'sub_stripe_123',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 86400,
        cancel_at_period_end: false,
      };

      mockStripeService.constructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: { object: mockStripeSub },
      });

      const existingSub = {
        id: 'sub-uuid',
        stripeSubscriptionId: 'sub_stripe_123',
        status: SubscriptionStatus.ACTIVE,
      };
      mockSubscriptionRepository.findOne.mockResolvedValue(existingSub);

      await service.handleWebhook('payload', 'sig');

      expect(mockSubscriptionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active',
          cancelAtPeriodEnd: false,
        }),
      );
    });

    it('should handle customer.subscription.deleted event', async () => {
      const mockStripeSub = {
        id: 'sub_stripe_123',
        status: 'canceled',
        current_period_end: Math.floor(Date.now() / 1000),
        cancel_at_period_end: false,
      };

      mockStripeService.constructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: { object: mockStripeSub },
      });

      const existingSub = {
        id: 'sub-uuid',
        stripeSubscriptionId: 'sub_stripe_123',
        status: SubscriptionStatus.ACTIVE,
      };
      mockSubscriptionRepository.findOne.mockResolvedValue(existingSub);

      const freePlan = { id: 'free-plan-uuid', slug: SubscriptionPlan.FREE };
      mockPlanRepository.findOne.mockResolvedValue(freePlan);

      await service.handleWebhook('payload', 'sig');

      expect(mockSubscriptionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SubscriptionStatus.CANCELED,
          plan: SubscriptionPlan.FREE,
        }),
      );
    });
  });

  // ─── cancelSubscription ──────────────────────────────────────
  describe('cancelSubscription', () => {
    it('should cancel subscription via Stripe', async () => {
      const existingSub = {
        userId: 'user-1',
        stripeSubscriptionId: 'sub_stripe_123',
        status: SubscriptionStatus.ACTIVE,
      };
      mockSubscriptionRepository.findOne.mockResolvedValue(existingSub);
      mockStripeService.cancelSubscription.mockResolvedValue({
        cancel_at_period_end: true,
        status: 'active',
      });

      const result = await service.cancelSubscription('user-1');

      expect(result.message).toContain('canceled at the end of the current period');
      expect(mockSubscriptionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ cancelAtPeriodEnd: true }),
      );
    });

    it('should throw if no active subscription', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(null);

      await expect(service.cancelSubscription('user-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ─── isPremium ───────────────────────────────────────────────
  describe('isPremium', () => {
    it('should return true for active premium monthly subscription', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue({
        plan: SubscriptionPlan.PREMIUM_MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 86400000),
      });

      expect(await service.isPremium('user-1')).toBe(true);
    });

    it('should return false for expired subscription', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue({
        plan: SubscriptionPlan.PREMIUM_MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: new Date(Date.now() - 86400000), // past
      });

      expect(await service.isPremium('user-1')).toBe(false);
    });

    it('should return false for free plan', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue({
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: null,
      });

      expect(await service.isPremium('user-1')).toBe(false);
    });

    it('should return false for no subscription', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(null);

      expect(await service.isPremium('user-1')).toBe(false);
    });
  });
});
