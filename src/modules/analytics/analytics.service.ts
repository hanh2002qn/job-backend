import { Injectable, Logger } from '@nestjs/common';
import { ApplicationStatus } from '../tracker/entities/job-tracker.entity';
import { SubscriptionService } from '../subscription/subscription.service';
import { FollowUpStatus } from '../follow-up/entities/follow-up.entity';
import { CacheService } from '../../common/redis/cache.service';
import { CACHE_TTL } from '../../common/redis/queue.constants';
import { JobTrackerRepository } from '../tracker/job-tracker.repository';
import { CvRepository } from '../cv/cv.repository';
import { FollowUpRepository } from '../follow-up/follow-up.repository';

export type AnalyticsPeriod = '7d' | '30d' | '90d';

interface FunnelData {
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
  successRate: string;
}

export interface AnalyticsOverview {
  isDemo: boolean;
  demoMessage?: string;
  summary: {
    totalTracked: number;
    totalSaved: number;
    activeApplications: number;
    interviews: number;
    offers: number;
    cvGenerated: number;
  };
  funnel: FunnelData;
  cvStats: {
    total: number;
    avgScore: number;
    templates: Record<string, number> | null;
  };
  timeline: Array<{ date: string; count: number }> | null;
  followUp: {
    total: number;
    sent: number;
    scheduled: number;
    responseRate: string | null;
  };
  conversionRate: string | null;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly trackerRepository: JobTrackerRepository,
    private readonly cvRepository: CvRepository,
    private readonly followUpRepository: FollowUpRepository,
    private readonly subscriptionService: SubscriptionService,
    private readonly cacheService: CacheService,
  ) {}

  async getOverview(userId: string, period: AnalyticsPeriod = '7d'): Promise<AnalyticsOverview> {
    const cacheKey = this.cacheService.buildKey('analytics', userId, period);

    return this.cacheService.wrap<AnalyticsOverview>(
      cacheKey,
      () => this.computeOverview(userId, period),
      CACHE_TTL.USER_STATS,
    );
  }

  private async computeOverview(
    userId: string,
    period: AnalyticsPeriod,
  ): Promise<AnalyticsOverview> {
    // 1. Funnel — SQL aggregation instead of loading all records
    const funnelRaw = await this.trackerRepository
      .createQueryBuilder('t')
      .select('t.status', 'status')
      .addSelect('COUNT(*)::int', 'count')
      .where('t.userId = :userId', { userId })
      .groupBy('t.status')
      .getRawMany<{ status: ApplicationStatus; count: number }>();

    const statusCounts: Record<string, number> = {};
    let totalTracked = 0;
    for (const row of funnelRaw) {
      statusCounts[row.status] = Number(row.count);
      totalTracked += Number(row.count);
    }

    const saved = statusCounts[ApplicationStatus.SAVED] || 0;
    const applied = statusCounts[ApplicationStatus.APPLIED] || 0;
    const interview = statusCounts[ApplicationStatus.INTERVIEW] || 0;
    const offer = statusCounts[ApplicationStatus.OFFER] || 0;
    const rejected = statusCounts[ApplicationStatus.REJECTED] || 0;
    const totalApplications = applied + interview + offer + rejected;

    // 2. CV stats — SQL aggregation
    const cvStatsRaw = await this.cvRepository
      .createQueryBuilder('cv')
      .select('COUNT(*)::int', 'total')
      .addSelect('COALESCE(AVG(cv.score), 0)::int', 'avgScore')
      .where('cv.userId = :userId', { userId })
      .getRawOne<{ total: number; avgScore: number }>();

    const cvTotal = Number(cvStatsRaw?.total ?? 0);
    const avgCvScore = Number(cvStatsRaw?.avgScore ?? 0);

    // 3. Check if user has data
    if (totalTracked === 0 && cvTotal === 0) {
      return this.getDemoOverview();
    }

    // 4. Template usage (small dataset — OK to load)
    const templates = await this.cvRepository
      .createQueryBuilder('cv')
      .select("COALESCE(cv.template, 'Default')", 'template')
      .addSelect('COUNT(*)::int', 'count')
      .where('cv.userId = :userId', { userId })
      .groupBy('cv.template')
      .getRawMany<{ template: string; count: number }>();

    const templateUsage: Record<string, number> = {};
    for (const row of templates) {
      templateUsage[row.template] = Number(row.count);
    }

    // 5. Timeline — SQL aggregation with configurable period
    const days = this.periodToDays(period);
    const timeline = await this.getTimelineData(userId, days);

    // 6. Follow-up stats — SQL aggregation
    const followUpRaw = await this.followUpRepository
      .createQueryBuilder('f')
      .select('COUNT(*)::int', 'total')
      .addSelect(`COUNT(*) FILTER (WHERE f.status = '${FollowUpStatus.SENT}')::int`, 'sent')
      .addSelect(
        `COUNT(*) FILTER (WHERE f.status = '${FollowUpStatus.SCHEDULED}')::int`,
        'scheduled',
      )
      .addSelect(`COUNT(*) FILTER (WHERE f."openedAt" IS NOT NULL)::int`, 'opened')
      .where('f.userId = :userId', { userId })
      .getRawOne<{ total: number; sent: number; scheduled: number; opened: number }>();

    const followUpTotal = Number(followUpRaw?.total ?? 0);
    const followUpSent = Number(followUpRaw?.sent ?? 0);
    const followUpScheduled = Number(followUpRaw?.scheduled ?? 0);
    const followUpOpened = Number(followUpRaw?.opened ?? 0);

    const funnel: FunnelData = {
      saved,
      applied,
      interview,
      offer,
      rejected,
      successRate:
        totalApplications > 0 ? ((offer / totalApplications) * 100).toFixed(1) + '%' : '0%',
    };

    return {
      isDemo: false,
      summary: {
        totalTracked,
        totalSaved: saved,
        activeApplications: totalApplications,
        interviews: interview,
        offers: offer,
        cvGenerated: cvTotal,
      },
      funnel,
      cvStats: {
        total: cvTotal,
        avgScore: avgCvScore,
        templates: templateUsage,
      },
      timeline,
      followUp: {
        total: followUpTotal,
        sent: followUpSent,
        scheduled: followUpScheduled,
        responseRate: this.calculateResponseRate(followUpSent, followUpOpened),
      },
      conversionRate:
        totalApplications > 0 ? ((interview / totalApplications) * 100).toFixed(1) + '%' : '0%',
    };
  }

  private getDemoOverview(): AnalyticsOverview {
    return {
      isDemo: true,
      demoMessage: 'Đây là dữ liệu mẫu. Hãy bắt đầu tìm việc để xem phân tích thực tế!',
      summary: {
        totalTracked: 12,
        totalSaved: 5,
        activeApplications: 7,
        interviews: 3,
        offers: 1,
        cvGenerated: 4,
      },
      funnel: {
        saved: 5,
        applied: 7,
        interview: 3,
        offer: 1,
        rejected: 2,
        successRate: '14.3%',
      },
      cvStats: {
        total: 4,
        avgScore: 78,
        templates: { 'ATS-friendly': 2, modern: 1, 'premium-elegant': 1 },
      },
      timeline: [
        { date: this.getDateString(-6), count: 1 },
        { date: this.getDateString(-5), count: 0 },
        { date: this.getDateString(-4), count: 2 },
        { date: this.getDateString(-3), count: 3 },
        { date: this.getDateString(-2), count: 1 },
        { date: this.getDateString(-1), count: 2 },
        { date: this.getDateString(0), count: 3 },
      ],
      followUp: {
        total: 5,
        sent: 3,
        scheduled: 2,
        responseRate: '40%',
      },
      conversionRate: '42.9%',
    };
  }

  /**
   * Calculate REAL response rate from openedAt tracking
   */
  private calculateResponseRate(sent: number, opened: number): string {
    if (sent === 0) return '0%';
    return ((opened / sent) * 100).toFixed(1) + '%';
  }

  private periodToDays(period: AnalyticsPeriod): number {
    switch (period) {
      case '30d':
        return 30;
      case '90d':
        return 90;
      case '7d':
      default:
        return 7;
    }
  }

  private getDateString(daysOffset: number): string {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  }

  private async getTimelineData(
    userId: string,
    days: number,
  ): Promise<Array<{ date: string; count: number }>> {
    // Generate date series in JS, count from DB
    const dateLabels: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      dateLabels.push(this.getDateString(-i));
    }

    const raw = await this.trackerRepository
      .createQueryBuilder('t')
      .select('DATE(t."createdAt")::text', 'date')
      .addSelect('COUNT(*)::int', 'count')
      .where('t.userId = :userId', { userId })
      .andWhere('t."createdAt" >= NOW() - :interval::interval', {
        interval: `${days} days`,
      })
      .groupBy('DATE(t."createdAt")')
      .getRawMany<{ date: string; count: number }>();

    const countMap: Record<string, number> = {};
    for (const row of raw) {
      countMap[row.date] = Number(row.count);
    }

    return dateLabels.map((date) => ({ date, count: countMap[date] || 0 }));
  }
}
