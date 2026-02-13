import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvImportSession } from '../entities/cv-import-session.entity';
import { ProfileSkill } from '../entities/profile-skill.entity';
import { ProfileExperience } from '../entities/profile-experience.entity';
import { ProfileProject } from '../entities/profile-project.entity';
import { ImportStatus, DataSource, type ParsedFields } from '../interfaces/profile-enums';
import { LLM_SERVICE, type LlmService } from '../../ai/llm.interface';

@Injectable()
export class CvImportSessionService {
  constructor(
    @InjectRepository(CvImportSession)
    private sessionRepository: Repository<CvImportSession>,
    @InjectRepository(ProfileSkill)
    private skillsRepository: Repository<ProfileSkill>,
    @InjectRepository(ProfileExperience)
    private experienceRepository: Repository<ProfileExperience>,
    @InjectRepository(ProfileProject)
    private projectsRepository: Repository<ProfileProject>,
    @Inject(LLM_SERVICE) private llmService: LlmService,
  ) {}

  async findByProfileId(profileId: string): Promise<CvImportSession[]> {
    return this.sessionRepository.find({
      where: { profileId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(profileId: string, sessionId: string): Promise<CvImportSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, profileId },
    });
    if (!session) {
      throw new NotFoundException('Import session not found');
    }
    return session;
  }

  async createFromText(profileId: string, rawText: string): Promise<CvImportSession> {
    const parsedFields = await this.parseWithAI(rawText);
    const lowConfidenceFields = this.identifyLowConfidenceFields(parsedFields);

    const session = this.sessionRepository.create({
      profileId,
      rawText,
      parsedFields,
      lowConfidenceFields,
      status: ImportStatus.PARSED,
    });

    return this.sessionRepository.save(session);
  }

  private async parseWithAI(rawText: string): Promise<ParsedFields> {
    const systemInstruction = `
      You are a CV parser. Extract structured data from the provided CV text.
      
      CRITICAL INSTRUCTIONS:
      1. Only extract factual information from the CV text.
      2. If something is unclear, set confidence to a low value (0.3-0.5).
      3. Do not invent or assume any information.
    `;

    const prompt = `
      Parse the following CV text and extract structured data:
      
      ### CV TEXT START ###
      ${rawText}
      ### CV TEXT END ###
      
      Return JSON with this structure:
      {
        "skills": [
          { "name": "skill name", "category": "technical|professional|interpersonal", "confidence": 0.0-1.0 }
        ],
        "experiences": [
          { "organization": "company", "role": "title", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "description": "brief", "confidence": 0.0-1.0 }
        ],
        "projects": [
          { "name": "project name", "description": "brief", "role": "your role", "confidence": 0.0-1.0 }
        ]
      }
    `;

    try {
      const result = await this.llmService.generateJson<ParsedFields>(prompt, systemInstruction);
      return result || { skills: [], experiences: [], projects: [] };
    } catch {
      return { skills: [], experiences: [], projects: [] };
    }
  }

  private identifyLowConfidenceFields(parsed: ParsedFields): string[] {
    const lowConfidence: string[] = [];
    const threshold = 0.6;

    parsed.skills.forEach((s, i) => {
      if (s.confidence < threshold) {
        lowConfidence.push(`skills[${i}]`);
      }
    });

    parsed.experiences.forEach((e, i) => {
      if (e.confidence < threshold) {
        lowConfidence.push(`experiences[${i}]`);
      }
    });

    parsed.projects.forEach((p, i) => {
      if (p.confidence < threshold) {
        lowConfidence.push(`projects[${i}]`);
      }
    });

    return lowConfidence;
  }

  async confirm(
    profileId: string,
    sessionId: string,
  ): Promise<{ skills: number; experiences: number; projects: number }> {
    const session = await this.findOne(profileId, sessionId);

    if (session.status !== ImportStatus.PARSED) {
      throw new BadRequestException('Session is not in parsed state');
    }

    const { parsedFields } = session;
    let skillsCreated = 0;
    let experiencesCreated = 0;
    let projectsCreated = 0;

    // Import skills
    for (const skill of parsedFields.skills) {
      await this.skillsRepository.save(
        this.skillsRepository.create({
          profileId,
          name: skill.name,
          category: skill.category,
          source: DataSource.CV_PARSE,
          confidence: skill.confidence,
        }),
      );
      skillsCreated++;
    }

    // Import experiences
    for (const exp of parsedFields.experiences) {
      await this.experienceRepository.save(
        this.experienceRepository.create({
          profileId,
          organization: exp.organization,
          role: exp.role,
          startDate: exp.startDate ? new Date(exp.startDate) : null,
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          source: DataSource.CV_PARSE,
          confidence: exp.confidence,
        }),
      );
      experiencesCreated++;
    }

    // Import projects
    for (const proj of parsedFields.projects) {
      await this.projectsRepository.save(
        this.projectsRepository.create({
          profileId,
          name: proj.name,
          description: proj.description,
          role: proj.role,
          source: DataSource.CV_PARSE,
          confidence: proj.confidence,
        }),
      );
      projectsCreated++;
    }

    // Update session status
    session.status = ImportStatus.CONFIRMED;
    session.confirmedAt = new Date();
    await this.sessionRepository.save(session);

    return { skills: skillsCreated, experiences: experiencesCreated, projects: projectsCreated };
  }

  async discard(profileId: string, sessionId: string): Promise<void> {
    const session = await this.findOne(profileId, sessionId);

    if (session.status !== ImportStatus.PARSED) {
      throw new BadRequestException('Session is not in parsed state');
    }

    session.status = ImportStatus.DISCARDED;
    await this.sessionRepository.save(session);
  }
}
