import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillRoadmap } from './entities/skill-roadmap.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { JobsService } from '../jobs/jobs.service';
import { GeminiService } from '../ai/gemini.service';
import { GenerateRoadmapDto } from './dto/skill-roadmap.dto';

export interface RoadmapTopic {
  topic: string;
  isCompleted: boolean;
  resources: string[]; // List of links or titles
}

export interface RoadmapPhase {
  phase: string;
  estimatedTime: string;
  topics: RoadmapTopic[];
}

export interface RoadmapResponse {
  targetGoal: string;
  skillGaps: string[];
  roadmap: RoadmapPhase[];
  careerAdvice: string;
}

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
      
      Return JSON ONLY with this exact structure:
      {
        "targetGoal": "...",
        "skillGaps": ["skill 1", "skill 2"],
        "roadmap": [
          {
            "phase": "Phase 1: Foundations",
            "estimatedTime": "2-4 weeks",
            "topics": [
              {
                "topic": "Topic Name",
                "isCompleted": false,
                "resources": ["https://resource-link.com", "Book Title"]
              }
            ]
          }
        ],
        "careerAdvice": "Brief professional advice..."
      }
    `;

    const roadmapData = await this.geminiService.generateJson<RoadmapResponse>(prompt);

    const roadmap = this.roadmapRepository.create({
      userId,
      targetGoal: dto.targetGoal,
      roadmapData: roadmapData as unknown as Record<string, unknown>, // Cast to satisfy TypeORM
    });

    return this.roadmapRepository.save(roadmap);
  }

  async updateProgress(
    userId: string,
    roadmapId: string,
    phaseIndex: number,
    topicIndex: number,
    isCompleted: boolean,
  ) {
    const roadmap = await this.roadmapRepository.findOne({ where: { id: roadmapId, userId } });
    if (!roadmap) throw new NotFoundException('Roadmap not found');

    const data = roadmap.roadmapData as unknown as RoadmapResponse;

    if (data.roadmap && data.roadmap[phaseIndex] && data.roadmap[phaseIndex].topics[topicIndex]) {
      data.roadmap[phaseIndex].topics[topicIndex].isCompleted = isCompleted;

      // Force update by re-assigning (TypeORM jsonb deep update detection)
      roadmap.roadmapData = { ...data };
      return this.roadmapRepository.save(roadmap);
    }

    throw new NotFoundException('Topic not found in roadmap');
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
