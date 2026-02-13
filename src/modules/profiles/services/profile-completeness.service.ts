import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileSkill } from '../entities/profile-skill.entity';
import { ProfileExperience } from '../entities/profile-experience.entity';
import { ProfileProject } from '../entities/profile-project.entity';
import { CareerIntent } from '../entities/career-intent.entity';
import { Profile } from '../entities/profile.entity';
import { SkillLevel } from '../interfaces/profile-enums';
import { LLM_SERVICE, type LlmService } from '../../ai/llm.interface';
import { CacheService } from '../../../common/redis/cache.service';
import { CACHE_TTL } from '../../../common/redis/queue.constants';

export interface CompletenessResult {
  targetRole: string;
  readinessScore: number;
  missingElements: MissingElement[];
}

export interface MissingElement {
  type: 'skill' | 'experience' | 'project' | 'career_intent' | 'overview';
  description: string;
  priority: 'high' | 'medium' | 'low';
}

@Injectable()
export class ProfileCompletenessService {
  private readonly logger = new Logger(ProfileCompletenessService.name);

  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(ProfileSkill)
    private skillsRepository: Repository<ProfileSkill>,
    @InjectRepository(ProfileExperience)
    private experienceRepository: Repository<ProfileExperience>,
    @InjectRepository(ProfileProject)
    private projectsRepository: Repository<ProfileProject>,
    @InjectRepository(CareerIntent)
    private careerIntentRepository: Repository<CareerIntent>,
    @Inject(LLM_SERVICE) private llmService: LlmService,
    private readonly cacheService: CacheService,
  ) {}

  async calculateCompleteness(profileId: string, targetRole: string): Promise<CompletenessResult> {
    const cacheKey = `profile:completeness:${profileId}:${targetRole}`;

    // Wrap the entire calculation logic with cacheService.wrap
    return this.cacheService.wrap(
      cacheKey,
      async () => {
        const [profile, skills, experiences, projects, careerIntent] = await Promise.all([
          this.profileRepository.findOne({ where: { id: profileId } }),
          this.skillsRepository.find({ where: { profileId } }),
          this.experienceRepository.find({ where: { profileId } }),
          this.projectsRepository.find({ where: { profileId } }),
          this.careerIntentRepository.findOne({ where: { profileId } }),
        ]);

        // First, calculate base score from profile completeness
        let baseScore = 0;
        const missingElements: MissingElement[] = [];

        // Overview check (20% weight)
        if (profile?.fullName) baseScore += 5;
        else
          missingElements.push({
            type: 'overview',
            description: 'Missing full name',
            priority: 'high',
          });

        if (profile?.currentRole) baseScore += 5;
        else
          missingElements.push({
            type: 'overview',
            description: 'Missing current role',
            priority: 'medium',
          });

        if (profile?.seniorityLevel) baseScore += 5;
        if (profile?.yearsOfExperience) baseScore += 5;

        // Skills check (25% weight)
        if (skills.length >= 5) baseScore += 15;
        else if (skills.length >= 3) baseScore += 10;
        else if (skills.length >= 1) baseScore += 5;
        else
          missingElements.push({
            type: 'skill',
            description: 'No skills added yet',
            priority: 'high',
          });

        const strongSkills = skills.filter((s) => s.level === SkillLevel.STRONG).length;
        if (strongSkills >= 3) baseScore += 10;
        else if (strongSkills >= 1) baseScore += 5;

        // Experience check (30% weight)
        if (experiences.length >= 2) baseScore += 20;
        else if (experiences.length >= 1) baseScore += 10;
        else
          missingElements.push({
            type: 'experience',
            description: 'No work experience added',
            priority: 'high',
          });

        const experiencesWithImpact = experiences.filter((e) =>
          e.responsibilities.some((r) => r.impact || r.metrics.length > 0),
        ).length;
        if (experiencesWithImpact >= 1) baseScore += 10;
        else if (experiences.length > 0) {
          missingElements.push({
            type: 'experience',
            description: 'Experience entries lack impact/metrics',
            priority: 'medium',
          });
        }

        // Project check (15% weight - important for fresher/switch)
        if (projects.length >= 2) baseScore += 15;
        else if (projects.length >= 1) baseScore += 10;

        // Career intent check (10% weight)
        if (careerIntent?.applyNowRoles?.length) baseScore += 5;
        else
          missingElements.push({
            type: 'career_intent',
            description: 'No target roles set',
            priority: 'medium',
          });

        if (careerIntent?.targetRoles?.length) baseScore += 5;

        // Use AI to get role-specific gaps
        const aiGaps = await this.analyzeRoleGaps(targetRole, skills, experiences, projects);
        missingElements.push(...aiGaps);

        // Adjust score based on AI analysis
        const gapPenalty =
          aiGaps.filter((g) => g.priority === 'high').length * 5 +
          aiGaps.filter((g) => g.priority === 'medium').length * 2;

        const finalScore = Math.max(0, Math.min(100, baseScore - gapPenalty));

        return {
          targetRole,
          readinessScore: finalScore / 100,
          missingElements: missingElements.slice(0, 10), // Limit to 10 items
        };
      },
      CACHE_TTL.PROFILE, // Use PROFILE TTL (30 mins) from constants
    );
  }

  private async analyzeRoleGaps(
    targetRole: string,
    skills: ProfileSkill[],
    experiences: ProfileExperience[],
    projects: ProfileProject[],
  ): Promise<MissingElement[]> {
    const skillNames = skills.map((s) => s.name);
    const experienceRoles = experiences.map((e) => e.role);

    const prompt = `
      Analyze the profile for a candidate targeting the role: "${targetRole}"
      
      Current skills: ${skillNames.join(', ') || 'None'}
      Current experience roles: ${experienceRoles.join(', ') || 'None'}
      Projects count: ${projects.length}
      
      Identify 0-3 CRITICAL gaps that would prevent this candidate from being considered for "${targetRole}".
      
      Return JSON array:
      [
        { "type": "skill|experience|project", "description": "what is missing", "priority": "high|medium|low" }
      ]
      
      If the profile is reasonably complete for this role, return an empty array [].
    `;

    try {
      const result = await this.llmService.generateJson<MissingElement[]>(prompt);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      this.logger.warn(
        `AI role gap analysis failed for "${targetRole}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Return empty array - base score calculation still works without AI gaps
      return [];
    }
  }

  async getRecommendedNextSteps(profileId: string): Promise<string[]> {
    const completeness = await this.calculateCompleteness(profileId, 'general');

    const steps: string[] = [];
    const highPriority = completeness.missingElements.filter((e) => e.priority === 'high');

    highPriority.forEach((e) => {
      switch (e.type) {
        case 'skill':
          steps.push('Add your key skills with proficiency levels');
          break;
        case 'experience':
          steps.push('Add your work experience with impact descriptions');
          break;
        case 'project':
          steps.push('Add projects to showcase your abilities');
          break;
        case 'career_intent':
          steps.push('Set your career goals and target roles');
          break;
        case 'overview':
          steps.push('Complete your profile overview');
          break;
      }
    });

    return [...new Set(steps)].slice(0, 5);
  }
}
