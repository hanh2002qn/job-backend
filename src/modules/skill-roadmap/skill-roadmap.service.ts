import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillRoadmap } from './entities/skill-roadmap.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { JobsService } from '../jobs/jobs.service';
import { GeminiService } from '../ai/gemini.service';
import { GenerateRoadmapDto } from './dto/skill-roadmap.dto';

@Injectable()
export class SkillRoadmapService {
  constructor(
    @InjectRepository(SkillRoadmap)
    private roadmapRepository: Repository<SkillRoadmap>,
    private profilesService: ProfilesService,
    private jobsService: JobsService,
    private geminiService: GeminiService,
  ) {}

  async generate(userId: string, dto: GenerateRoadmapDto) {
    const profile = await this.profilesService.findByUserId(userId);
    if (!profile) throw new NotFoundException('Please complete your profile first');

    let context = `Target Goal: ${dto.targetGoal}\n`;
    if (dto.jobId) {
      const job = await this.jobsService.findOne(dto.jobId);
      if (job) {
        context += `Job Details: ${job.title} at ${job.company}. Description: ${job.description}\n`;
      }
    }

    const currentSkills = profile.skills?.join(', ') || 'Not specified';

    const prompt = `
      You are a world-class career growth advisor.
      User Profile:
      - Current Skills: ${currentSkills}
      - Experience Level: ${profile.experience?.length || 0} roles
      
      Goal: ${dto.targetGoal}
      ${context}
      
      Task:
      1. Analyze the gap between current skills and the target goal.
      2. Generate a structured learning roadmap.
      
      Return JSON ONLY:
      {
        "targetGoal": "...",
        "skillGaps": ["skill 1", "skill 2"],
        "roadmap": [
          {
            "phase": "Phase 1: Foundations",
            "topics": ["topic 1", "topic 2"],
            "recommendedResources": ["resource 1", "link 1"],
            "estimatedTime": "2-4 weeks"
          }
        ],
        "careerAdvice": "Brief professional advice..."
      }
    `;

    const roadmapData = await this.geminiService.generateJson<Record<string, unknown>>(prompt);

    const roadmap = this.roadmapRepository.create({
      userId,
      targetGoal: dto.targetGoal,
      roadmapData,
    });

    return this.roadmapRepository.save(roadmap);
  }

  async getLatest(userId: string) {
    return this.roadmapRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(userId: string) {
    return this.roadmapRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
