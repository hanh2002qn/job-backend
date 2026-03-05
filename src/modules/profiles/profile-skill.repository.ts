import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { ProfileSkill } from './entities/profile-skill.entity';

@Injectable()
export class ProfileSkillRepository extends BaseRepository<ProfileSkill> {
  constructor(dataSource: DataSource) {
    super(ProfileSkill, dataSource.createEntityManager());
  }

  async findByProfileId(profileId: string): Promise<ProfileSkill[]> {
    return this.find({ where: { profileId } });
  }
}
