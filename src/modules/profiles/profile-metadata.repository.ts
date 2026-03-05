import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { ProfileMetadata } from './entities/profile-metadata.entity';

@Injectable()
export class ProfileMetadataRepository extends BaseRepository<ProfileMetadata> {
  constructor(dataSource: DataSource) {
    super(ProfileMetadata, dataSource.createEntityManager());
  }

  async findByProfileId(profileId: string): Promise<ProfileMetadata | null> {
    return this.findOne({ where: { profileId } });
  }
}
