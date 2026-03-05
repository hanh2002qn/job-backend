import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Between } from 'typeorm';
import { AiFeatureConfig } from '../../ai/entities/ai-feature-config.entity';
import { AiFeatureConfigRepository } from '../../ai/ai-feature-config.repository';
import { AiUsageRepository } from '../../ai/ai-usage.repository';
import { UpdateAiFeatureDto } from '../dto/ai-feature.dto';
import {
  OverallUsageStatsResponseDto,
  FeatureUsageStatsResponseDto,
} from '../dto/ai-usage-stats.dto';

const DEFAULT_FEATURES: Array<{ featureKey: string; displayName: string; description: string }> = [
  {
    featureKey: 'cv_parsing',
    displayName: 'CV Parsing',
    description: 'Parse CV bằng AI để extract structured data',
  },
  {
    featureKey: 'cv_import',
    displayName: 'CV Import',
    description: 'Import structured fields (skills, experience, projects) từ CV text',
  },
  {
    featureKey: 'profile_completeness',
    displayName: 'Profile Completeness',
    description: 'Phân tích gap cho target role bằng AI',
  },
  {
    featureKey: 'profile_insights',
    displayName: 'Profile Insights',
    description: 'AI-generated insights và suggestions cho profile',
  },
  {
    featureKey: 'cv_generation',
    displayName: 'CV Generation',
    description: 'Tối ưu CV content bằng AI',
  },
  {
    featureKey: 'follow_up_email',
    displayName: 'Follow-up Email',
    description: 'Draft follow-up email bằng AI',
  },
  {
    featureKey: 'cover_letter',
    displayName: 'Cover Letter',
    description: 'Tạo cover letter bằng AI',
  },
  {
    featureKey: 'interview_prep',
    displayName: 'Interview Prep',
    description: 'AI tips chuẩn bị phỏng vấn',
  },
  {
    featureKey: 'job_extraction',
    displayName: 'Job Extraction',
    description: 'Extract job data từ HTML bằng AI',
  },
  {
    featureKey: 'job_matching',
    displayName: 'Job Matching',
    description: 'AI matching score + job recommendations',
  },
];

@Injectable()
export class AdminAiService implements OnModuleInit {
  private readonly logger = new Logger(AdminAiService.name);

  constructor(
    private featureConfigRepository: AiFeatureConfigRepository,
    private aiUsageRepository: AiUsageRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaultFeatures();
  }

  // ============ Feature Config CRUD ============

  async listFeatures(): Promise<AiFeatureConfig[]> {
    return this.featureConfigRepository.find({
      order: { featureKey: 'ASC' },
    });
  }

  async getFeature(id: string): Promise<AiFeatureConfig> {
    const feature = await this.featureConfigRepository.findOne({ where: { id } });
    if (!feature) throw new NotFoundException('AI feature config not found');
    return feature;
  }

  async getFeatureByKey(featureKey: string): Promise<AiFeatureConfig | null> {
    return this.featureConfigRepository.findOne({ where: { featureKey } });
  }

  async updateFeature(id: string, dto: UpdateAiFeatureDto): Promise<AiFeatureConfig> {
    const feature = await this.getFeature(id);
    Object.assign(feature, dto);
    return this.featureConfigRepository.save(feature);
  }

  async toggleFeature(id: string, isEnabled: boolean): Promise<AiFeatureConfig> {
    const feature = await this.getFeature(id);
    feature.isEnabled = isEnabled;
    return this.featureConfigRepository.save(feature);
  }

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

  // ============ User Rate Limit Check ============

  async getUserDailyUsageCount(userId: string, featureKey: string): Promise<number> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return this.aiUsageRepository.count({
      where: { userId, feature: featureKey, createdAt: Between(startOfDay, now) },
    });
  }

  // ============ Seed ============

  private async seedDefaultFeatures(): Promise<void> {
    for (const feature of DEFAULT_FEATURES) {
      const existing = await this.featureConfigRepository.findOne({
        where: { featureKey: feature.featureKey },
      });
      if (!existing) {
        await this.featureConfigRepository.save(
          this.featureConfigRepository.create({
            ...feature,
            isEnabled: true,
            maxRequestsPerDay: 0,
          }),
        );
        this.logger.log(`Seeded AI feature: ${feature.featureKey}`);
      }
    }
  }
}
