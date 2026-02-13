import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkPreferences } from '../entities/work-preferences.entity';
import { UpdateWorkPreferencesDto } from '../dto/work-preferences.dto';
import { DataSource } from '../interfaces/profile-enums';

@Injectable()
export class WorkPreferencesService {
  constructor(
    @InjectRepository(WorkPreferences)
    private workPreferencesRepository: Repository<WorkPreferences>,
  ) {}

  async findByProfileId(profileId: string): Promise<WorkPreferences | null> {
    return this.workPreferencesRepository.findOne({
      where: { profileId },
    });
  }

  async upsert(profileId: string, dto: UpdateWorkPreferencesDto): Promise<WorkPreferences> {
    let prefs = await this.findByProfileId(profileId);

    if (!prefs) {
      prefs = this.workPreferencesRepository.create({
        profileId,
        source: DataSource.USER,
      });
    }

    if (dto.locations) prefs.locations = dto.locations;
    if (dto.workMode) prefs.workMode = dto.workMode;
    if (dto.workingHours) prefs.workingHours = dto.workingHours;
    if (dto.languages) prefs.languages = dto.languages;
    if (dto.dealBreakers) prefs.dealBreakers = dto.dealBreakers;

    prefs.source = DataSource.USER;

    return this.workPreferencesRepository.save(prefs);
  }

  async getDealBreakers(profileId: string): Promise<string[]> {
    const prefs = await this.findByProfileId(profileId);
    return prefs?.dealBreakers || [];
  }
}
