import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Job } from '../../jobs/entities/job.entity';
import { CV } from '../../cv/entities/cv.entity';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionPlan,
} from '../../subscription/entities/subscription.entity';
import { CacheService } from '../../../common/redis/cache.service';
import { StripeService } from '../../subscription/stripe.service';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(CV)
    private cvRepository: Repository<CV>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private readonly cacheService: CacheService,
    private readonly stripeService: StripeService,
  ) {}

  async getStats() {
    const totalUsers = await this.usersRepository.count();
    const activeJobs = await this.jobsRepository.count({ where: { expired: false } });
    const totalJobs = await this.jobsRepository.count();
    const totalCvs = await this.cvRepository.count();

    // Revenue & Subscriptions
    const totalSubscriptions = await this.subscriptionRepository.count();
    const activeSubscriptions = await this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.ACTIVE },
    });

    // Breakdown by plan
    const premiumMonthly = await this.subscriptionRepository.count({
      where: { plan: SubscriptionPlan.PREMIUM_MONTHLY, status: SubscriptionStatus.ACTIVE },
    });
    const premiumYearly = await this.subscriptionRepository.count({
      where: { plan: SubscriptionPlan.PREMIUM_YEARLY, status: SubscriptionStatus.ACTIVE },
    });

    return {
      users: {
        total: totalUsers,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
      },
      cvs: {
        total: totalCvs,
      },
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        breakdown: {
          monthly: premiumMonthly,
          yearly: premiumYearly,
        },
      },
    };
  }

  async getUserGrowth() {
    // Get user growth for the last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const users = await this.usersRepository.find({
      select: ['createdAt'],
      where: {
        createdAt: Between(thirtyDaysAgo, today),
      },
    });

    // Group by date
    const growth = {};
    users.forEach((user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      growth[date] = (growth[date] || 0) + 1;
    });

    return Object.entries(growth).map(([date, count]) => ({ date, count }));
  }

  async setMaintenanceMode(enabled: boolean): Promise<void> {
    await this.cacheService.set('MAINTENANCE_MODE', String(enabled));
  }

  async getTransactions() {
    const charges = await this.stripeService.listTransactions();
    return charges.data.map((charge) => ({
      id: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      status: charge.status,
      created: new Date(charge.created * 1000),
      customer: charge.customer,
      receipt_url: charge.receipt_url,
    }));
  }
}
