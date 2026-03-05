import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { ProfileExperience } from './entities/profile-experience.entity';

@Injectable()
export class ProfileExperienceRepository extends BaseRepository<ProfileExperience> {
  constructor(dataSource: DataSource) {
    super(ProfileExperience, dataSource.createEntityManager());
  }

  async findByProfileId(profileId: string): Promise<ProfileExperience[]> {
    return this.find({ where: { profileId } });
  }
}
