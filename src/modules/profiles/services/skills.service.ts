import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ProfileSkill } from '../entities/profile-skill.entity';
import { Profile } from '../entities/profile.entity';
import { CreateSkillDto, UpdateSkillDto, MergeSkillsDto } from '../dto/skill.dto';
import { DataSource } from '../interfaces/profile-enums';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(ProfileSkill)
    private skillsRepository: Repository<ProfileSkill>,
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
  ) {}

  async findAll(profileId: string): Promise<ProfileSkill[]> {
    return this.skillsRepository.find({
      where: { profileId },
      order: { level: 'ASC', name: 'ASC' },
    });
  }

  async findOne(profileId: string, skillId: string): Promise<ProfileSkill> {
    const skill = await this.skillsRepository.findOne({
      where: { id: skillId, profileId },
    });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    return skill;
  }

  async create(profileId: string, dto: CreateSkillDto): Promise<ProfileSkill> {
    // Check for possible duplicates
    const existing = await this.skillsRepository.findOne({
      where: {
        profileId,
        name: ILike(dto.name),
      },
    });

    const skill = this.skillsRepository.create({
      profileId,
      name: dto.name,
      category: dto.category,
      level: dto.level,
      contexts: dto.contexts || [],
      evidence: dto.evidence || [],
      lastUsedYear: dto.lastUsedYear,
      source: DataSource.USER,
      confidence: 1.0,
      possibleDuplicate: !!existing,
    });

    return this.skillsRepository.save(skill);
  }

  async update(profileId: string, skillId: string, dto: UpdateSkillDto): Promise<ProfileSkill> {
    const skill = await this.findOne(profileId, skillId);

    // Update source to USER when manually edited
    Object.assign(skill, dto, { source: DataSource.USER });

    return this.skillsRepository.save(skill);
  }

  async remove(profileId: string, skillId: string): Promise<void> {
    const skill = await this.findOne(profileId, skillId);
    await this.skillsRepository.remove(skill);
  }

  async findDuplicates(profileId: string): Promise<ProfileSkill[]> {
    return this.skillsRepository.find({
      where: { profileId, possibleDuplicate: true },
    });
  }

  async merge(profileId: string, dto: MergeSkillsDto): Promise<ProfileSkill> {
    const { skillIds, targetName } = dto;

    // Fetch all skills to merge
    const skills = await this.skillsRepository.find({
      where: skillIds.map((id) => ({ id, profileId })),
    });

    if (skills.length !== skillIds.length) {
      throw new NotFoundException('One or more skills not found');
    }

    // Combine all contexts and evidence
    const combinedContexts = skills.flatMap((s) => s.contexts);
    const combinedEvidence = skills.flatMap((s) => s.evidence);

    // Use highest confidence level
    const highestLevel = skills.reduce((best, s) => {
      const levelOrder = { strong: 0, used_before: 1, learning: 2 };
      return levelOrder[s.level] < levelOrder[best.level] ? s : best;
    }, skills[0]);

    // Create merged skill
    const mergedSkill = this.skillsRepository.create({
      profileId,
      name: targetName,
      category: highestLevel.category,
      level: highestLevel.level,
      contexts: combinedContexts,
      evidence: combinedEvidence,
      lastUsedYear: Math.max(...skills.map((s) => s.lastUsedYear || 0)) || null,
      source: DataSource.USER,
      confidence: 1.0,
      possibleDuplicate: false,
    });

    // Remove old skills and save merged one
    await this.skillsRepository.remove(skills);
    return this.skillsRepository.save(mergedSkill);
  }

  async bulkCreate(profileId: string, dtos: CreateSkillDto[]): Promise<ProfileSkill[]> {
    const skills = dtos.map((dto) =>
      this.skillsRepository.create({
        profileId,
        name: dto.name,
        category: dto.category,
        level: dto.level,
        contexts: dto.contexts || [],
        evidence: dto.evidence || [],
        lastUsedYear: dto.lastUsedYear,
        source: DataSource.USER,
        confidence: 1.0,
      }),
    );
    return this.skillsRepository.save(skills);
  }
}
