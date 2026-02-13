import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileMetadata } from '../entities/profile-metadata.entity';
import { ProfileInsight, InsightTrigger } from '../entities/profile-insight.entity';
import { GeminiService } from '../../ai/gemini.service';
import { ProfileSkill } from '../entities/profile-skill.entity';
import { ProfileExperience } from '../entities/profile-experience.entity';

@Injectable()
export class ProfileInsightsService {
  constructor(
    @InjectRepository(ProfileMetadata)
    private metadataRepository: Repository<ProfileMetadata>,
    @InjectRepository(ProfileInsight)
    private insightRepository: Repository<ProfileInsight>,
    @InjectRepository(ProfileSkill)
    private skillsRepository: Repository<ProfileSkill>,
    @InjectRepository(ProfileExperience)
    private experienceRepository: Repository<ProfileExperience>,
    private geminiService: GeminiService,
  ) {}

  async recordUsage(
    profileId: string,
    usageType: 'cvGenerated' | 'jobMatched' | 'mockInterview',
  ): Promise<void> {
    let metadata = await this.metadataRepository.findOne({ where: { profileId } });

    if (!metadata) {
      metadata = this.metadataRepository.create({
        profileId,
        usedFor: { cvGenerated: 0, jobMatched: 0, mockInterview: 0 },
      });
    }

    metadata.usedFor[usageType] = (metadata.usedFor[usageType] || 0) + 1;
    await this.metadataRepository.save(metadata);
  }

  async recordAIAnalysis(profileId: string): Promise<void> {
    let metadata = await this.metadataRepository.findOne({ where: { profileId } });

    if (!metadata) {
      metadata = this.metadataRepository.create({
        profileId,
        usedFor: { cvGenerated: 0, jobMatched: 0, mockInterview: 0 },
      });
    }

    metadata.lastAiAnalysis = new Date();
    await this.metadataRepository.save(metadata);
  }

  async getUsageStats(profileId: string): Promise<ProfileMetadata | null> {
    return this.metadataRepository.findOne({ where: { profileId } });
  }

  // Get all insights for a profile
  async getInsights(profileId: string, unreadOnly = false): Promise<ProfileInsight[]> {
    const where: { profileId: string; isRead?: boolean } = { profileId };
    if (unreadOnly) {
      where.isRead = false;
    }

    return this.insightRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  // Mark insight as read
  async markAsRead(profileId: string, insightId: string): Promise<ProfileInsight> {
    const insight = await this.insightRepository.findOne({
      where: { id: insightId, profileId },
    });

    if (!insight) {
      throw new Error('Insight not found');
    }

    insight.isRead = true;
    return this.insightRepository.save(insight);
  }

  // Mark insight as actioned
  async markAsActioned(profileId: string, insightId: string): Promise<ProfileInsight> {
    const insight = await this.insightRepository.findOne({
      where: { id: insightId, profileId },
    });

    if (!insight) {
      throw new Error('Insight not found');
    }

    insight.isActioned = true;
    return this.insightRepository.save(insight);
  }

  // Create and save insight to database
  async createInsight(
    profileId: string,
    trigger: InsightTrigger,
    context?: { jobTitle?: string; failureReason?: string; requiredSkills?: string[] },
  ): Promise<ProfileInsight> {
    const [skills, experiences] = await Promise.all([
      this.skillsRepository.find({ where: { profileId } }),
      this.experienceRepository.find({ where: { profileId } }),
    ]);

    const skillNames = skills.map((s) => s.name);
    const expRoles = experiences.map((e) => e.role);

    let insightText = '';
    let actionText = '';
    const relatedFields: string[] = [];

    // Use AI for complex analysis
    if (trigger === InsightTrigger.SKILL_GAP_DETECTED && context?.requiredSkills) {
      const aiInsight = await this.analyzeSkillGap(
        profileId,
        context.jobTitle || 'target role',
        context.requiredSkills,
      );
      insightText = aiInsight.insight;
      actionText = aiInsight.suggestedAction;
      relatedFields.push(...aiInsight.relatedProfileFields);
    } else {
      // Generate insight based on trigger
      const prompt = `
        A user just had this event: "${trigger}"
        ${context?.jobTitle ? `Job: ${context.jobTitle}` : ''}
        ${context?.failureReason ? `Reason: ${context.failureReason}` : ''}
        
        Their profile has skills: ${skillNames.join(', ') || 'None'}
        Their experience roles: ${expRoles.join(', ') || 'None'}
        
        Generate a helpful insight and suggested action.
        Return JSON:
        {
          "insight": "An encouraging, helpful insight about what might help",
          "suggestedAction": "One specific action they can take",
          "relatedProfileFields": ["skill", "experience", etc.]
        }
      `;

      try {
        const result = await this.geminiService.generateJson<{
          insight: string;
          suggestedAction: string;
          relatedProfileFields: string[];
        }>(prompt);

        insightText = result?.insight || 'Keep updating your profile to improve your chances.';
        actionText = result?.suggestedAction || 'Review your skills and experiences.';
        relatedFields.push(...(result?.relatedProfileFields || []));
      } catch {
        insightText = 'Keep updating your profile to improve your chances.';
        actionText = 'Review your skills and experiences.';
      }
    }

    // Save to database
    const insight = this.insightRepository.create({
      profileId,
      trigger,
      insight: insightText,
      suggestedAction: actionText,
      relatedProfileFields: relatedFields,
    });

    await this.recordAIAnalysis(profileId);
    return this.insightRepository.save(insight);
  }

  private async analyzeSkillGap(
    profileId: string,
    jobTitle: string,
    requiredSkills: string[],
  ): Promise<{ insight: string; suggestedAction: string; relatedProfileFields: string[] }> {
    const skills = await this.skillsRepository.find({ where: { profileId } });
    const skillNames = skills.map((s) => s.name.toLowerCase());

    const missingSkills = requiredSkills.filter(
      (rs) => !skillNames.some((sn) => sn.includes(rs.toLowerCase())),
    );

    if (missingSkills.length > 0) {
      return {
        insight: `Your profile is missing skills commonly required for ${jobTitle}: ${missingSkills.slice(0, 3).join(', ')}`,
        suggestedAction: `Consider learning or adding these skills: ${missingSkills[0]}`,
        relatedProfileFields: missingSkills.map((s) => `skill:${s}`),
      };
    }

    return {
      insight: `Your skills align well with ${jobTitle} requirements`,
      suggestedAction: 'Continue building experience in your current skill set',
      relatedProfileFields: [],
    };
  }
}
