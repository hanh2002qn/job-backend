import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Job } from '../../jobs/entities/job.entity';
import { CV } from '../../cv/entities/cv.entity';
import { Subscription, SubscriptionStatus } from '../../subscription/entities/subscription.entity';
import { StripeService } from '../../subscription/stripe.service';
import { SettingsService } from '../../settings/settings.service';

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
    private readonly settingsService: SettingsService,
    private readonly stripeService: StripeService,
  ) {}

  async getStats() {
    // Run all counts in parallel instead of sequential
    const [
      totalUsers,
      totalJobs,
      activeJobs,
      totalCvs,
      totalSubscriptions,
      activeSubscriptions,
      premiumMonthly,
      premiumYearly,
    ] = await Promise.all([
      this.usersRepository.count(),
      this.jobsRepository.count(),
      this.jobsRepository.count({ where: { expired: false } }),
      this.cvRepository.count(),
      this.subscriptionRepository.count(),
      this.subscriptionRepository.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      this.subscriptionRepository.count({
        where: { planDetails: { slug: 'premium_monthly' }, status: SubscriptionStatus.ACTIVE },
        relations: ['planDetails'],
      }),
      this.subscriptionRepository.count({
        where: { planDetails: { slug: 'premium_yearly' }, status: SubscriptionStatus.ACTIVE },
        relations: ['planDetails'],
      }),
    ]);

    return {
      users: { total: totalUsers },
      jobs: { total: totalJobs, active: activeJobs },
      cvs: { total: totalCvs },
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        breakdown: { monthly: premiumMonthly, yearly: premiumYearly },
      },
    };
  }

  async getUserGrowth() {
    // SQL aggregation instead of loading all users into memory
    const result = await this.usersRepository
      .createQueryBuilder('user')
      .select("TO_CHAR(user.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)::int', 'count')
      .where("user.createdAt >= NOW() - INTERVAL '30 days'")
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: number }>();

    return result.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async setMaintenanceMode(enabled: boolean): Promise<void> {
    await this.settingsService.update('maintenance_mode', { value: enabled });
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
