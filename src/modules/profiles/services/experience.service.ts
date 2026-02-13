import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileExperience } from '../entities/profile-experience.entity';
import { CreateExperienceDto, UpdateExperienceDto } from '../dto/experience.dto';
import { DataSource } from '../interfaces/profile-enums';

@Injectable()
export class ExperienceService {
  constructor(
    @InjectRepository(ProfileExperience)
    private experienceRepository: Repository<ProfileExperience>,
  ) {}

  async findAll(profileId: string): Promise<ProfileExperience[]> {
    return this.experienceRepository.find({
      where: { profileId },
      order: { startDate: 'DESC' },
    });
  }

  async findOne(profileId: string, experienceId: string): Promise<ProfileExperience> {
    const experience = await this.experienceRepository.findOne({
      where: { id: experienceId, profileId },
    });
    if (!experience) {
      throw new NotFoundException('Experience not found');
    }
    return experience;
  }

  async create(profileId: string, dto: CreateExperienceDto): Promise<ProfileExperience> {
    const experience = this.experienceRepository.create({
      profileId,
      organization: dto.organization,
      role: dto.role,
      employmentType: dto.employmentType,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      responsibilities: dto.responsibilities || [],
      scope: dto.scope,
      skillsUsed: dto.skillsUsed || [],
      source: DataSource.USER,
      confidence: 1.0,
    });

    return this.experienceRepository.save(experience);
  }

  async update(
    profileId: string,
    experienceId: string,
    dto: UpdateExperienceDto,
  ): Promise<ProfileExperience> {
    const experience = await this.findOne(profileId, experienceId);

    if (dto.organization) experience.organization = dto.organization;
    if (dto.role) experience.role = dto.role;
    if (dto.employmentType) experience.employmentType = dto.employmentType;
    if (dto.startDate) experience.startDate = new Date(dto.startDate);
    if (dto.endDate) experience.endDate = new Date(dto.endDate);
    if (dto.responsibilities) experience.responsibilities = dto.responsibilities;
    if (dto.scope) experience.scope = dto.scope;
    if (dto.skillsUsed) experience.skillsUsed = dto.skillsUsed;

    experience.source = DataSource.USER;

    return this.experienceRepository.save(experience);
  }

  async remove(profileId: string, experienceId: string): Promise<void> {
    const experience = await this.findOne(profileId, experienceId);
    await this.experienceRepository.remove(experience);
  }

  async linkSkills(
    profileId: string,
    experienceId: string,
    skillIds: string[],
  ): Promise<ProfileExperience> {
    const experience = await this.findOne(profileId, experienceId);
    experience.skillsUsed = [...new Set([...experience.skillsUsed, ...skillIds])];
    return this.experienceRepository.save(experience);
  }

  async unlinkSkill(
    profileId: string,
    experienceId: string,
    skillId: string,
  ): Promise<ProfileExperience> {
    const experience = await this.findOne(profileId, experienceId);
    experience.skillsUsed = experience.skillsUsed.filter((id) => id !== skillId);
    return this.experienceRepository.save(experience);
  }
}
