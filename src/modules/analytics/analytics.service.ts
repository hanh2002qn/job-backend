import { Injectable } from '@nestjs/common';
import { TrackerService } from '../tracker/tracker.service';
import { CvService } from '../cv/cv.service';
import { ApplicationStatus, JobTracker } from '../tracker/entities/job-tracker.entity';
import { SubscriptionService } from '../subscription/subscription.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUp, FollowUpStatus } from '../follow-up/entities/follow-up.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    private trackerService: TrackerService,
    private cvService: CvService,
    private subscriptionService: SubscriptionService,
    @InjectRepository(FollowUp)
    private followUpRepository: Repository<FollowUp>,
  ) {}

  async getOverview(userId: string) {
    const trackedJobs = await this.trackerService.findAll(userId);
    const cvs = await this.cvService.findAll(userId);
    const followUps = await this.followUpRepository.find({ where: { userId } });
    const isPremium = await this.subscriptionService.isPremium(userId);

    // Check if user has any data, if not return demo data
    const hasData = trackedJobs.length > 0 || cvs.length > 0;

    if (!hasData) {
      return this.getDemoOverview(isPremium);
    }

    const saved = trackedJobs.filter((t) => t.status === ApplicationStatus.SAVED).length;
    const applied = trackedJobs.filter((t) => t.status === ApplicationStatus.APPLIED).length;
    const interview = trackedJobs.filter((t) => t.status === ApplicationStatus.INTERVIEW).length;
    const offer = trackedJobs.filter((t) => t.status === ApplicationStatus.OFFER).length;
    const rejected = trackedJobs.filter((t) => t.status === ApplicationStatus.REJECTED).length;

    const totalApplications = applied + interview + offer + rejected;

    // 1. Success Funnel
    const funnel = {
      saved,
      applied,
      interview,
      offer,
      rejected,
      successRate:
        totalApplications > 0 ? ((offer / totalApplications) * 100).toFixed(1) + '%' : '0%',
    };

    // 2. CV Effectiveness
    const avgCvScore =
      cvs.length > 0
        ? Math.round(cvs.reduce((acc, cv) => acc + (cv.score || 0), 0) / cvs.length)
        : 0;

    const templateUsage = cvs.reduce(
      (acc, cv) => {
        const name = cv.template || 'Default';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // 3. Timeline (Last 7 days)
    const timeline = this.getTimelineData(trackedJobs);

    // 4. Follow-up Stats
    const followUpStats = {
      total: followUps.length,
      sent: followUps.filter((f) => f.status === FollowUpStatus.SENT).length,
      scheduled: followUps.filter((f) => f.status === FollowUpStatus.SCHEDULED).length,
      responseRate: isPremium ? this.calculateResponseRate(followUps) : 'Premium Only',
    };

    return {
      isPremium,
      isDemo: false,
      summary: {
        totalTracked: trackedJobs.length,
        totalSaved: saved,
        activeApplications: totalApplications,
        interviews: interview,
        offers: offer,
        cvGenerated: cvs.length,
      },
      funnel,
      cvStats: {
        total: cvs.length,
        avgScore: avgCvScore,
        templates: isPremium ? templateUsage : { locked: 'Upgrade to Premium' },
      },
      timeline: isPremium ? timeline : [],
      followUp: followUpStats,
      conversionRate: isPremium
        ? totalApplications > 0
          ? ((interview / totalApplications) * 100).toFixed(1) + '%'
          : '0%'
        : 'Premium Only',
    };
  }

  private getDemoOverview(isPremium: boolean) {
    return {
      isPremium,
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
        templates: isPremium
          ? {
              'ATS-friendly': 2,
              modern: 1,
              'premium-elegant': 1,
            }
          : { locked: 'Upgrade to Premium' },
      },
      timeline: isPremium
        ? [
            { date: this.getDateString(-6), count: 1 },
            { date: this.getDateString(-5), count: 0 },
            { date: this.getDateString(-4), count: 2 },
            { date: this.getDateString(-3), count: 3 },
            { date: this.getDateString(-2), count: 1 },
            { date: this.getDateString(-1), count: 2 },
            { date: this.getDateString(0), count: 3 },
          ]
        : [],
      followUp: {
        total: 5,
        sent: 3,
        scheduled: 2,
        responseRate: isPremium ? '40%' : 'Premium Only',
      },
      conversionRate: isPremium ? '42.9%' : 'Premium Only',
    };
  }

  private calculateResponseRate(followUps: FollowUp[]): string {
    // Mock calculation - in real app, track actual responses
    const sent = followUps.filter((f) => f.status === FollowUpStatus.SENT).length;
    if (sent === 0) return '0%';
    // Assume 20-30% response rate for demo
    return `${Math.round(sent * 0.25)}%`;
  }

  private getDateString(daysAgo: number): string {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  }

  private getTimelineData(trackers: JobTracker[]) {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const data = last7Days.map((date) => {
      const count = trackers.filter((t) => t.createdAt.toISOString().split('T')[0] === date).length;
      return { date, count };
    });

    return data;
  }
}
