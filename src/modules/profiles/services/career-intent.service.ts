import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareerIntent } from '../entities/career-intent.entity';
import { UpdateCareerIntentDto } from '../dto/career-intent.dto';
import { DataSource } from '../interfaces/profile-enums';

@Injectable()
export class CareerIntentService {
  constructor(
    @InjectRepository(CareerIntent)
    private careerIntentRepository: Repository<CareerIntent>,
  ) {}

  async findByProfileId(profileId: string): Promise<CareerIntent | null> {
    return this.careerIntentRepository.findOne({
      where: { profileId },
    });
  }

  async upsert(profileId: string, dto: UpdateCareerIntentDto): Promise<CareerIntent> {
    let careerIntent = await this.findByProfileId(profileId);

    if (!careerIntent) {
      careerIntent = this.careerIntentRepository.create({
        profileId,
        source: DataSource.USER,
        confidence: 1.0,
      });
    }

    if (dto.applyNowRoles) careerIntent.applyNowRoles = dto.applyNowRoles;
    if (dto.targetRoles) careerIntent.targetRoles = dto.targetRoles;
    if (dto.desiredSeniority) careerIntent.desiredSeniority = dto.desiredSeniority;
    if (dto.salaryExpectation) {
      careerIntent.salaryExpectation = {
        min: dto.salaryExpectation.min ?? null,
        max: dto.salaryExpectation.max ?? null,
        currency: dto.salaryExpectation.currency,
      };
    }
    if (dto.companyPreferences) careerIntent.companyPreferences = dto.companyPreferences;
    if (dto.industries) careerIntent.industries = dto.industries;
    if (dto.avoid) {
      careerIntent.avoid = {
        roles: dto.avoid.roles || [],
        industries: dto.avoid.industries || [],
        skills: dto.avoid.skills || [],
      };
    }

    careerIntent.source = DataSource.USER;
    careerIntent.confidence = 1.0;

    return this.careerIntentRepository.save(careerIntent);
  }

  async getApplyNowRoles(profileId: string): Promise<string[]> {
    const intent = await this.findByProfileId(profileId);
    return intent?.applyNowRoles || [];
  }

  async getTargetRoles(profileId: string): Promise<string[]> {
    const intent = await this.findByProfileId(profileId);
    return intent?.targetRoles || [];
  }
}
