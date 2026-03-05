import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { ProfileInsight } from './entities/profile-insight.entity';

@Injectable()
export class ProfileInsightRepository extends BaseRepository<ProfileInsight> {
  constructor(dataSource: DataSource) {
    super(ProfileInsight, dataSource.createEntityManager());
  }

  async findByProfileId(profileId: string): Promise<ProfileInsight[]> {
    return this.find({ where: { profileId } });
  }

  async findUnreadByProfileId(profileId: string): Promise<ProfileInsight[]> {
    return this.find({ where: { profileId, isRead: false } });
  }
}
