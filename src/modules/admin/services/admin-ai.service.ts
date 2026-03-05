import { Injectable, Logger } from '@nestjs/common';
import { Between } from 'typeorm';
import { AiUsageRepository } from '../../ai/ai-usage.repository';
import {
  OverallUsageStatsResponseDto,
  FeatureUsageStatsResponseDto,
} from '../dto/ai-usage-stats.dto';

@Injectable()
export class AdminAiService {
  private readonly logger = new Logger(AdminAiService.name);

  constructor(private aiUsageRepository: AiUsageRepository) {}

  // ============ Usage Analytics ============

  async getOverallUsageStats(): Promise<OverallUsageStatsResponseDto> {
    const [totals, byFeature, byModel, last7Days] = await Promise.all([
      this.aiUsageRepository
        .createQueryBuilder('u')
        .select('SUM(u.totalTokens)', 'totalTokens')
        .addSelect('COUNT(*)', 'totalRequests')
        .addSelect('SUM(u.cost)', 'totalCost')
        .getRawOne<{ totalTokens: string; totalRequests: string; totalCost: string }>(),

      this.aiUsageRepository
        .createQueryBuilder('u')
        .select('u.feature', 'feature')
        .addSelect('SUM(u.totalTokens)', 'totalTokens')
        .addSelect('COUNT(*)', 'totalRequests')
        .addSelect('SUM(u.cost)', 'totalCost')
        .groupBy('u.feature')
        .orderBy('totalTokens', 'DESC')
        .getRawMany<{
          feature: string;
          totalTokens: string;
          totalRequests: string;
          totalCost: string;
        }>(),

      this.aiUsageRepository
        .createQueryBuilder('u')
        .select('u.model', 'model')
        .addSelect('SUM(u.totalTokens)', 'totalTokens')
        .addSelect('COUNT(*)', 'totalRequests')
        .groupBy('u.model')
        .orderBy('totalTokens', 'DESC')
        .getRawMany<{ model: string; totalTokens: string; totalRequests: string }>(),

      this.aiUsageRepository
        .createQueryBuilder('u')
        .select("TO_CHAR(u.createdAt, 'YYYY-MM-DD')", 'date')
        .addSelect('SUM(u.totalTokens)', 'totalTokens')
        .addSelect('COUNT(*)', 'totalRequests')
        .where("u.createdAt >= NOW() - INTERVAL '7 days'")
        .groupBy('date')
        .orderBy('date', 'ASC')
        .getRawMany<{ date: string; totalTokens: string; totalRequests: string }>(),
    ]);

    return {
      totalTokens: Number(totals?.totalTokens || 0),
      totalRequests: Number(totals?.totalRequests || 0),
      totalCost: Number(totals?.totalCost || 0),
      byFeature: byFeature.map((r) => ({
        feature: r.feature,
        totalTokens: Number(r.totalTokens),
        totalRequests: Number(r.totalRequests),
        totalCost: Number(r.totalCost),
      })),
      byModel: byModel.map((r) => ({
        model: r.model,
        totalTokens: Number(r.totalTokens),
        totalRequests: Number(r.totalRequests),
      })),
      last7Days: last7Days.map((r) => ({
        date: r.date,
        totalTokens: Number(r.totalTokens),
        totalRequests: Number(r.totalRequests),
      })),
    };
  }

  async getFeatureUsageStats(featureKey: string): Promise<FeatureUsageStatsResponseDto> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totals, todayCount, last7Days, topUsers] = await Promise.all([
      this.aiUsageRepository
        .createQueryBuilder('u')
        .select('SUM(u.totalTokens)', 'totalTokens')
        .addSelect('COUNT(*)', 'totalRequests')
        .addSelect('SUM(u.cost)', 'totalCost')
        .where('u.feature = :featureKey', { featureKey })
        .getRawOne<{ totalTokens: string; totalRequests: string; totalCost: string }>(),

      this.aiUsageRepository.count({
        where: { feature: featureKey, createdAt: Between(startOfDay, now) },
      }),

      this.aiUsageRepository
        .createQueryBuilder('u')
        .select("TO_CHAR(u.createdAt, 'YYYY-MM-DD')", 'date')
        .addSelect('SUM(u.totalTokens)', 'totalTokens')
        .addSelect('COUNT(*)', 'totalRequests')
        .where('u.feature = :featureKey', { featureKey })
        .andWhere("u.createdAt >= NOW() - INTERVAL '7 days'")
        .groupBy('date')
        .orderBy('date', 'ASC')
        .getRawMany<{ date: string; totalTokens: string; totalRequests: string }>(),

      this.aiUsageRepository
        .createQueryBuilder('u')
        .select('u.userId', 'userId')
        .addSelect('COUNT(*)', 'totalRequests')
        .addSelect('SUM(u.totalTokens)', 'totalTokens')
        .where('u.feature = :featureKey', { featureKey })
        .andWhere('u.userId IS NOT NULL')
        .groupBy('u.userId')
        .orderBy('totalRequests', 'DESC')
        .limit(10)
        .getRawMany<{ userId: string; totalRequests: string; totalTokens: string }>(),
    ]);

    return {
      feature: featureKey,
      totalTokens: Number(totals?.totalTokens || 0),
      totalRequests: Number(totals?.totalRequests || 0),
      totalCost: Number(totals?.totalCost || 0),
      todayRequests: todayCount,
      last7Days: last7Days.map((r) => ({
        date: r.date,
        totalTokens: Number(r.totalTokens),
        totalRequests: Number(r.totalRequests),
      })),
      topUsers: topUsers.map((r) => ({
        userId: r.userId,
        totalRequests: Number(r.totalRequests),
        totalTokens: Number(r.totalTokens),
      })),
    };
  }
}
