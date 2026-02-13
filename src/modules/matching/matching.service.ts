import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ProfilesService } from '../profiles/profiles.service';
import { JobsService } from '../jobs/jobs.service';
import { LLM_SERVICE, type LlmService } from '../ai/llm.interface';
import { Job } from '../jobs/entities/job.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { ExperienceRecord } from '../profiles/interfaces/profile.interface';
import { CacheService } from '../../common/redis/cache.service';

interface AIJobRecommendation {
  jobId: string;
  score: number;
  reasoning: string;
}

export interface FeedItem extends Job {
  matchScore?: number;
  isAiRecommended: boolean;
  reasoning?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  skillGap?: number;
}

@Injectable()
export class MatchingService {
  constructor(
    private profilesService: ProfilesService,
    private jobsService: JobsService,
    @Inject(LLM_SERVICE) private llmService: LlmService,
    private cacheService: CacheService,
  ) {}

  async matchJobs(userId: string) {
    const cacheKey = `matching:rules:${userId}`;
    return this.cacheService.wrap(
      cacheKey,
      async () => {
        const profile = await this.profilesService.findByUserId(userId);
        if (!profile) {
          throw new NotFoundException('Profile not found');
        }

        const jobs = await this.jobsService.findAll({});
        const userSkills = profile.skills?.map((s) => s.toLowerCase().trim()) || [];

        const matchedJobs = jobs.data.map((job) => {
          const result = this.calculateMatch(job, profile, userSkills);
          return {
            ...job,
            ...result,
          };
        });

        return matchedJobs
          .filter((job) => job.matchScore > 10) // Only show relevant ones
          .sort((a, b) => b.matchScore - a.matchScore);
      },
      3600 * 1000, // 1 hour cache
    );
  }

  async getFeed(userId: string, page = 1, limit = 20) {
    // Parallel fetch: AI Recs (Cached) + Rule-based (Cached)
    const [aiResult, ruleMatchedJobs] = await Promise.all([
      this.getAIRecommendations(userId),
      this.matchJobs(userId),
    ]);

    // Safely map AI results
    const aiJobs: FeedItem[] = (aiResult?.recommendations || [])
      .map((r: AIJobRecommendation & { job?: Job | null }) => {
        // Ensure r.job is not null before access
        if (!r.job) return null;
        const job = r.job;
        return {
          ...job,
          matchScore: r.score,
          isAiRecommended: true,
          reasoning: r.reasoning,
        } as FeedItem;
      })
      .filter((item): item is FeedItem => item !== null);

    // Safely map Rule-based results
    // matchJobs returns array of combined job+matchResult
    const ruleJobs: FeedItem[] = ((ruleMatchedJobs as unknown as FeedItem[]) || []).map((j) => ({
      ...j,
      isAiRecommended: false,
    }));

    // Merge: AI first, then Rule-based
    const combined: FeedItem[] = [...aiJobs];
    const aiIds = new Set(aiJobs.map((j) => j.id));

    for (const job of ruleJobs) {
      if (!aiIds.has(job.id)) {
        combined.push(job);
      }
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const items = combined.slice(startIndex, startIndex + limit);

    return {
      data: items,
      meta: {
        total: combined.length,
        page,
        limit,
        totalPages: Math.ceil(combined.length / limit),
      },
    };
  }

  async matchSpecificJob(userId: string, jobId: string) {
    const profile = await this.profilesService.findByUserId(userId);
    const job = await this.jobsService.findOne(jobId);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (!job) throw new NotFoundException('Job not found');

    const userSkills = profile.skills?.map((s) => s.toLowerCase().trim()) || [];
    const result = this.calculateMatch(job, profile, userSkills);

    // Add extra AI-like insights
    const recommendations =
      result.missingSkills.length > 0
        ? `To better fit this role, focus on learning: ${result.missingSkills.slice(0, 3).join(', ')}.`
        : 'Your profile is an excellent match for this role!';

    return {
      job,
      ...result,
      recommendations,
      experienceMatch: this.isExperienceMatch(job.experienceLevel, profile.experience),
    };
  }

  async getSemanticMatch(userId: string, jobId: string) {
    const cacheKey = `matching:semantic:${userId}:${jobId}`;
    return this.cacheService.wrap(
      cacheKey,
      async () => {
        const profile = await this.profilesService.findByUserId(userId);
        const job = await this.jobsService.findOne(jobId);
        if (!profile || !job) throw new NotFoundException('Profile or Job not found');

        const prompt = `
          Analyze the fit between this Candidate and Job.
          
          Candidate:
          Skills: ${profile.skills?.join(', ')}
          Experience: ${JSON.stringify(profile.experience)}
          
          Job:
          Title: ${job.title}
          Description: ${job.description}
          Skills: ${job.skills?.join(', ')}

          Return JSON:
          {
            "score": 0-100,
            "pros": ["strength 1", "strength 2"],
            "cons": ["gap 1", "gap 2"],
            "verdict": "Brief conclusion"
          }
        `;

        return this.llmService.generateJson(prompt);
      },
      24 * 3600 * 1000, // 24 hours
    );
  }

  // ============ AI-Powered Recommendations ============

  async getAIRecommendations(userId: string) {
    const cacheKey = `matching:ai:${userId}`;
    return this.cacheService.wrap(
      cacheKey,
      async () => {
        const profile = await this.profilesService.findByUserId(userId);
        if (!profile) {
          throw new NotFoundException('Profile not found');
        }

        // Get recent jobs for analysis
        const recentJobs = await this.jobsService.getRecentJobs(30);

        if (recentJobs.length === 0) {
          return { recommendations: [], message: 'No jobs available for recommendations' };
        }

        // Build profile summary for AI
        const profileSummary = {
          skills: profile.skills || [],
          experience: (profile.experience || []).map((e) => ({
            role: e.role,
            company: e.company,
            years: e.years,
          })),
          education: (profile.education || []).map((e) => ({
            school: e.school,
            degree: e.degree,
            field: e.field,
          })),
          preferredIndustries: profile.preferredIndustries || [],
          preferredLocations: profile.preferredLocations || [],
          preferredJobTypes: profile.preferredJobTypes || [],
        };

        // Build jobs summary for AI
        const jobsSummary = recentJobs.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          skills: job.skills?.slice(0, 10) || [],
          experienceLevel: job.experienceLevel,
          industry: job.industry,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
        }));

        const prompt = `
          You are an expert career advisor. Analyze the candidate's profile and match them with the most suitable jobs.
          
          CANDIDATE PROFILE:
          ${JSON.stringify(profileSummary, null, 2)}
          
          AVAILABLE JOBS:
          ${JSON.stringify(jobsSummary, null, 2)}
          
          Instructions:
          1. Analyze the candidate's skills, experience, and preferences
          2. Score each job from 0-100 based on fit
          3. Return the TOP 10 most suitable jobs with reasoning
          
          Return a JSON array with this structure:
          [
            {
              "jobId": "uuid-of-job",
              "score": 85,
              "reasoning": "Brief explanation why this job is a good match"
            }
          ]
          
          Sort by score descending. Only include jobs with score >= 50.
        `;

        try {
          const aiRecommendations =
            await this.llmService.generateJson<AIJobRecommendation[]>(prompt);

          // Enrich with full job data
          const enrichedRecommendations = aiRecommendations
            .slice(0, 10)
            .map((rec) => {
              const job = recentJobs.find((j) => j.id === rec.jobId);
              return {
                ...rec,
                job: job || null,
              };
            })
            .filter((rec) => rec.job !== null);

          return {
            recommendations: enrichedRecommendations,
            profileCompleteness: profile.completenessScore,
          };
        } catch {
          // Fallback to rule-based matching if AI fails
          // Note: Avoid circular dependency or recursion depth issues by calling internal logic or separate method if complex
          // For now, return empty or safe fallback
          return { recommendations: [], message: 'AI failed, try later' };
        }
      },
      12 * 3600 * 1000, // 12 hours cache
    );
  }

  private calculateMatch(job: Job, profile: Profile, userSkills: string[]) {
    const jobSkills = job.skills || [];

    if (jobSkills.length === 0) {
      return {
        matchScore: 50,
        matchedSkills: [],
        missingSkills: [],
        skillGap: 0,
      };
    }

    const matchedSkills = jobSkills.filter((skill) =>
      userSkills.some((us) => us.includes(skill) || skill.includes(us)),
    );

    const missingSkills = jobSkills.filter(
      (skill) => !userSkills.some((us) => us.includes(skill) || skill.includes(us)),
    );

    // Scoring Logic (0-100)
    const skillScore = Math.round((matchedSkills.length / jobSkills.length) * 100);

    // Factor in Location (+10 points)
    let bonus = 0;
    if (
      profile.address &&
      job.location &&
      job.location.toLowerCase().includes(profile.address.toLowerCase())
    ) {
      bonus += 10;
    }

    // Factor in Industry (+5 points)
    if (
      profile.preferredIndustries?.some((ind) =>
        job.category?.toLowerCase().includes(ind.toLowerCase()),
      )
    ) {
      bonus += 5;
    }

    const matchScore = Math.min(100, skillScore + bonus);

    return {
      matchScore,
      matchedSkills,
      missingSkills,
      skillGap: jobSkills.length - matchedSkills.length,
    };
  }

  private isExperienceMatch(requiredLevel: string | undefined, userExp: ExperienceRecord[]) {
    if (!requiredLevel) return true;

    // Simple heuristic: count years of experience
    const totalYears = (userExp || []).reduce((sum, exp) => {
      // Mock logic: assume each exp is 1 year if not specified
      const years = exp.years || 1;
      return sum + years;
    }, 0);

    if (requiredLevel.toLowerCase().includes('senior') && totalYears < 5) return false;
    if (requiredLevel.toLowerCase().includes('middle') && totalYears < 2) return false;

    return true;
  }
}
