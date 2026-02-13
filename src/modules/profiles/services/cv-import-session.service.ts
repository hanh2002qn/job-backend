import { Injectable, NotFoundException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvImportSession } from '../entities/cv-import-session.entity';
import { ProfileSkill } from '../entities/profile-skill.entity';
import { ProfileExperience } from '../entities/profile-experience.entity';
import { ProfileProject } from '../entities/profile-project.entity';
import {
  ImportStatus,
  DataSource,
  SkillCategory,
  type ParsedFields,
  type ParsedSkill,
  type ParsedExperience,
  type ParsedProject,
} from '../interfaces/profile-enums';
import { LLM_SERVICE, type LlmService } from '../../ai/llm.interface';

@Injectable()
export class CvImportSessionService {
  private readonly logger = new Logger(CvImportSessionService.name);

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

    // Validate and filter parsed data
    const validSkills = this.validateSkills(parsedFields.skills);
    const validExperiences = this.validateExperiences(parsedFields.experiences);
    const validProjects = this.validateProjects(parsedFields.projects);

    // Batch insert skills
    const skillEntities = validSkills.map((skill) =>
      this.skillsRepository.create({
        profileId,
        name: skill.name,
        category: skill.category || SkillCategory.TECHNICAL,
        source: DataSource.CV_PARSE,
        confidence: skill.confidence,
      }),
    );
    if (skillEntities.length > 0) {
      await this.skillsRepository.save(skillEntities);
    }

    // Batch insert experiences
    const experienceEntities = validExperiences.map((exp) =>
      this.experienceRepository.create({
        profileId,
        organization: exp.organization,
        role: exp.role,
        startDate: this.parseDate(exp.startDate),
        endDate: this.parseDate(exp.endDate),
        source: DataSource.CV_PARSE,
        confidence: exp.confidence,
      }),
    );
    if (experienceEntities.length > 0) {
      await this.experienceRepository.save(experienceEntities);
    }

    // Batch insert projects
    const projectEntities = validProjects.map((proj) =>
      this.projectsRepository.create({
        profileId,
        name: proj.name,
        description: proj.description,
        role: proj.role,
        source: DataSource.CV_PARSE,
        confidence: proj.confidence,
      }),
    );
    if (projectEntities.length > 0) {
      await this.projectsRepository.save(projectEntities);
    }

    // Update session status
    session.status = ImportStatus.CONFIRMED;
    session.confirmedAt = new Date();
    await this.sessionRepository.save(session);

    this.logger.log(
      `CV import confirmed for profile ${profileId}: ${skillEntities.length} skills, ${experienceEntities.length} experiences, ${projectEntities.length} projects`,
    );

    return {
      skills: skillEntities.length,
      experiences: experienceEntities.length,
      projects: projectEntities.length,
    };
  }

  // ============ Validation Helpers ============

  private validateSkills(skills: ParsedSkill[]): ParsedSkill[] {
    return skills.filter((skill) => {
      if (!skill.name || typeof skill.name !== 'string') return false;
      if (skill.name.trim().length === 0 || skill.name.length > 100) return false;
      if (typeof skill.confidence !== 'number' || skill.confidence < 0 || skill.confidence > 1) {
        skill.confidence = 0.5; // Default confidence
      }
      return true;
    });
  }

  private validateExperiences(experiences: ParsedExperience[]): ParsedExperience[] {
    return experiences.filter((exp) => {
      if (!exp.organization || typeof exp.organization !== 'string') return false;
      if (exp.organization.trim().length === 0) return false;
      if (!exp.role || typeof exp.role !== 'string') return false;
      if (typeof exp.confidence !== 'number' || exp.confidence < 0 || exp.confidence > 1) {
        exp.confidence = 0.5;
      }
      return true;
    });
  }

  private validateProjects(projects: ParsedProject[]): ParsedProject[] {
    return projects.filter((proj) => {
      if (!proj.name || typeof proj.name !== 'string') return false;
      if (proj.name.trim().length === 0) return false;
      if (typeof proj.confidence !== 'number' || proj.confidence < 0 || proj.confidence > 1) {
        proj.confidence = 0.5;
      }
      return true;
    });
  }

  private parseDate(dateStr?: string): Date | null {
    if (!dateStr || typeof dateStr !== 'string') return null;

    // Support formats: YYYY-MM, YYYY-MM-DD, YYYY
    const datePattern = /^(\d{4})(-(\d{2}))?(-(\d{2}))?$/;
    const match = dateStr.match(datePattern);

    if (!match) return null;

    const year = parseInt(match[1], 10);
    const month = match[3] ? parseInt(match[3], 10) - 1 : 0;
    const day = match[5] ? parseInt(match[5], 10) : 1;

    const date = new Date(year, month, day);

    // Validate date is reasonable (1950 - future 5 years)
    const minYear = 1950;
    const maxYear = new Date().getFullYear() + 5;
    if (year < minYear || year > maxYear) return null;

    return date;
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
