import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';
import { ProfilesService } from '../profiles/profiles.service';
import { JobsService } from '../jobs/jobs.service';
import { LLM_SERVICE } from '../ai/llm.interface';
import { CacheService } from '../../common/redis/cache.service';
import { NotFoundException } from '@nestjs/common';
import { JobLevel } from '../jobs/enums/job.enums';
import type { ExperienceRecord } from '../profiles/interfaces/profile.interface';

// Minimal profile mock — only fields accessed by matching service
const mockProfile = {
  id: 'profile-1',
  userId: 'user-1',
  skills: ['Node.js', 'TypeScript', 'React', 'PostgreSQL'],
  address: 'Ha Noi',
  preferredIndustries: ['IT - Phần mềm'],
  experience: [
    { role: 'Backend Developer', company: 'Tech Corp', years: 3 },
    { role: 'Fullstack Developer', company: 'Startup Inc', years: 2 },
  ] as ExperienceRecord[],
  completenessScore: 75,
};

// Minimal job mocks — only fields accessed by calculateMatch + isExperienceMatch
const mockJobs = [
  {
    id: 'job-1',
    title: 'Senior Node.js Developer',
    company: 'Google',
    location: 'Ha Noi',
    skills: ['node.js', 'typescript', 'docker', 'kubernetes'], // lowercase to match profile skills
    category: 'IT - Phần mềm',
    experienceLevel: JobLevel.SENIOR,
    description: 'Build scalable APIs',
  },
  {
    id: 'job-2',
    title: 'React Developer',
    company: 'Facebook',
    location: 'Ho Chi Minh',
    skills: ['react', 'typescript', 'graphql'], // lowercase
    category: 'Khác',
    experienceLevel: JobLevel.MIDDLE,
    description: 'Build UIs',
  },
  {
    id: 'job-3',
    title: 'Data Scientist',
    company: 'Amazon',
    location: 'Singapore',
    skills: ['python', 'tensorflow', 'spark'], // lowercase
    category: 'Khác',
    description: 'ML pipelines',
  },
  {
    id: 'job-4',
    title: 'Junior Developer',
    company: 'Local Corp',
    location: 'Ha Noi',
    skills: [],
    category: 'IT - Phần mềm',
    description: 'General development',
  },
];

const mockProfilesService = {
  findByUserId: jest.fn(),
};

const mockJobsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  getRecentJobs: jest.fn(),
};

const mockLlmService = {
  generateContent: jest.fn(),
  generateJson: jest.fn(),
  generateStream: jest.fn(),
  getPromptContent: jest.fn(),
};

// CacheService.wrap bypasses cache — executes callback immediately
const mockCacheService = {
  wrap: jest.fn().mockImplementation((_key: string, fn: () => Promise<unknown>) => fn()),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('MatchingService', () => {
  let service: MatchingService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: JobsService, useValue: mockJobsService },
        { provide: LLM_SERVICE, useValue: mockLlmService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── matchSpecificJob (tests calculateMatch internally) ───────
  describe('matchSpecificJob', () => {
    beforeEach(() => {
      mockProfilesService.findByUserId.mockResolvedValue(mockProfile);
    });

    it('should score high when skills + location + industry match', async () => {
      mockJobsService.findOne.mockResolvedValue(mockJobs[0]); // Node.js job in Ha Noi, IT

      const result = await service.matchSpecificJob('user-1', 'job-1');

      // 2/4 skills = 50% + location(10) + industry(5) = 65
      expect(result.matchScore).toBe(65);
      expect(result.matchedSkills).toContain('node.js');
      expect(result.matchedSkills).toContain('typescript');
      expect(result.missingSkills).toContain('docker');
      expect(result.missingSkills).toContain('kubernetes');
    });

    it('should return 50 for jobs with no required skills', async () => {
      mockJobsService.findOne.mockResolvedValue(mockJobs[3]);

      const result = await service.matchSpecificJob('user-1', 'job-4');

      expect(result.matchScore).toBe(50);
      expect(result.matchedSkills).toEqual([]);
    });

    it('should score low for completely mismatched skills', async () => {
      mockJobsService.findOne.mockResolvedValue(mockJobs[2]); // Python/TF/Spark

      const result = await service.matchSpecificJob('user-1', 'job-3');

      // 0/3 skills = 0%, no location match, no industry match = 0
      expect(result.matchScore).toBe(0);
      expect(result.missingSkills).toHaveLength(3);
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockProfilesService.findByUserId.mockResolvedValue(null);
      mockJobsService.findOne.mockResolvedValue(mockJobs[0]);

      await expect(service.matchSpecificJob('unknown', 'job-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if job not found', async () => {
      mockJobsService.findOne.mockResolvedValue(null);

      await expect(service.matchSpecificJob('user-1', 'invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── isExperienceMatch (tested through matchSpecificJob) ──────
  describe('experience matching', () => {
    beforeEach(() => {
      mockProfilesService.findByUserId.mockResolvedValue(mockProfile);
    });

    it('should match senior when user has 5+ years total', async () => {
      mockJobsService.findOne.mockResolvedValue(mockJobs[0]); // Senior

      const result = await service.matchSpecificJob('user-1', 'job-1');

      // 3 + 2 = 5 years, senior needs >= 5
      expect(result.experienceMatch).toBe(true);
    });

    it('should match middle when user has 2+ years', async () => {
      mockJobsService.findOne.mockResolvedValue(mockJobs[1]); // Middle

      const result = await service.matchSpecificJob('user-1', 'job-2');

      expect(result.experienceMatch).toBe(true);
    });

    it('should fail senior match for junior developer', async () => {
      const juniorProfile = {
        ...mockProfile,
        experience: [{ role: 'Intern', company: 'Small Co', years: 1 }] as ExperienceRecord[],
      };
      mockProfilesService.findByUserId.mockResolvedValue(juniorProfile);
      mockJobsService.findOne.mockResolvedValue(mockJobs[0]); // Senior

      const result = await service.matchSpecificJob('user-1', 'job-1');

      expect(result.experienceMatch).toBe(false);
    });
  });

  // ─── getFeed ──────────────────────────────────────────────────
  describe('getFeed', () => {
    beforeEach(() => {
      mockProfilesService.findByUserId.mockResolvedValue(mockProfile);
      mockJobsService.findAll.mockResolvedValue({ data: mockJobs });
      mockJobsService.getRecentJobs.mockResolvedValue(mockJobs);
    });

    it('should merge AI and rule-based results, AI first, with dedup', async () => {
      // AI recommends job-1 and job-2
      mockLlmService.generateJson.mockResolvedValue([
        { jobId: 'job-1', score: 90, reasoning: 'Great match' },
        { jobId: 'job-2', score: 80, reasoning: 'Good match' },
      ]);

      const result = await service.getFeed('user-1', 1, 20);

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta).toHaveProperty('total');
      expect(result.meta).toHaveProperty('page', 1);

      // AI-recommended items should exist
      const aiJobs = result.data.filter((item) => item.isAiRecommended);
      expect(aiJobs.length).toBe(2);

      // Rule-based should not duplicate AI jobs
      const ruleJobIds = result.data.filter((item) => !item.isAiRecommended).map((j) => j.id);
      expect(ruleJobIds).not.toContain('job-1');
      expect(ruleJobIds).not.toContain('job-2');
    });

    it('should handle AI failure gracefully and still return rule-based results', async () => {
      mockLlmService.generateJson.mockRejectedValue(new Error('AI service down'));

      const result = await service.getFeed('user-1', 1, 20);

      // Should still return results from rule-based
      expect(result.data).toBeDefined();
      expect(result.meta).toHaveProperty('total');
    });

    it('should paginate correctly', async () => {
      mockLlmService.generateJson.mockResolvedValue([]);

      const result = await service.getFeed('user-1', 1, 2);

      expect(result.data.length).toBeLessThanOrEqual(2);
      expect(result.meta.limit).toBe(2);
    });
  });
});
