import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileProject } from '../entities/profile-project.entity';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { DataSource } from '../interfaces/profile-enums';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProfileProject)
    private projectsRepository: Repository<ProfileProject>,
  ) {}

  async findAll(profileId: string): Promise<ProfileProject[]> {
    return this.projectsRepository.find({
      where: { profileId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(profileId: string, projectId: string): Promise<ProfileProject> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId, profileId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async create(profileId: string, dto: CreateProjectDto): Promise<ProfileProject> {
    const project = this.projectsRepository.create({
      profileId,
      name: dto.name,
      context: dto.context,
      description: dto.description || null,
      role: dto.role || null,
      skillsUsed: dto.skillsUsed || [],
      outcomes: dto.outcomes || [],
      source: DataSource.USER,
      confidence: 1.0,
    });

    return this.projectsRepository.save(project);
  }

  async update(
    profileId: string,
    projectId: string,
    dto: UpdateProjectDto,
  ): Promise<ProfileProject> {
    const project = await this.findOne(profileId, projectId);

    if (dto.name) project.name = dto.name;
    if (dto.context) project.context = dto.context;
    if (dto.description !== undefined) project.description = dto.description;
    if (dto.role !== undefined) project.role = dto.role;
    if (dto.skillsUsed) project.skillsUsed = dto.skillsUsed;
    if (dto.outcomes) project.outcomes = dto.outcomes;

    project.source = DataSource.USER;

    return this.projectsRepository.save(project);
  }

  async remove(profileId: string, projectId: string): Promise<void> {
    const project = await this.findOne(profileId, projectId);
    await this.projectsRepository.remove(project);
  }

  async linkSkills(
    profileId: string,
    projectId: string,
    skillIds: string[],
  ): Promise<ProfileProject> {
    const project = await this.findOne(profileId, projectId);
    project.skillsUsed = [...new Set([...project.skillsUsed, ...skillIds])];
    return this.projectsRepository.save(project);
  }
}
