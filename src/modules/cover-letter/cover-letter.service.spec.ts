import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoverLetterService } from './cover-letter.service';
import { CoverLetter } from './entities/cover-letter.entity';
import { JobsService } from '../jobs/jobs.service';
import { ProfilesService } from '../profiles/profiles.service';
import { LLM_SERVICE } from '../ai/llm.interface';

describe('CoverLetterService', () => {
  let service: CoverLetterService;
  let llmService: any;
  let profilesService: any;
  let jobsService: any;
  let repository: any;

  beforeEach(async () => {
    llmService = {
      getPromptContent: jest
        .fn()
        .mockResolvedValue('Name: {{candidateName}}, Skills: {{skills}} template'),
      generateContent: jest.fn().mockResolvedValue('Generated content'),
    };
    profilesService = {
      findByUserId: jest
        .fn()
        .mockResolvedValue({ fullName: 'John Doe', skills: ['TS'], experience: [] }),
    };
    jobsService = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'job-1', title: 'Dev', company: 'Tech', description: 'Desc' }),
    };
    repository = {
      create: jest.fn().mockReturnValue({}),
      save: jest.fn().mockResolvedValue({ id: 'cl-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoverLetterService,
        {
          provide: getRepositoryToken(CoverLetter),
          useValue: repository,
        },
        {
          provide: JobsService,
          useValue: jobsService,
        },
        {
          provide: ProfilesService,
          useValue: profilesService,
        },
        {
          provide: LLM_SERVICE,
          useValue: llmService,
        },
      ],
    }).compile();

    service = module.get<CoverLetterService>(CoverLetterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a cover letter using overrides', async () => {
    const dto = {
      jobId: 'job-1',
      fullName: 'Override Name',
      skills: ['JS'],
    };

    await service.generate('user-1', dto);

    expect(llmService.getPromptContent).toHaveBeenCalledWith(
      'COVER_LETTER_GENERATION',
      expect.any(String),
    );
    expect(llmService.generateContent).toHaveBeenCalledWith(
      expect.stringContaining('Override Name'),
      undefined,
      'user-1',
      'cover_letter',
    );
    expect(llmService.generateContent).toHaveBeenCalledWith(
      expect.stringContaining('JS'),
      undefined,
      'user-1',
      'cover_letter',
    );
  });
});
