import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { ProfileProject } from './entities/profile-project.entity';

@Injectable()
export class ProfileProjectRepository extends BaseRepository<ProfileProject> {
  constructor(dataSource: DataSource) {
    super(ProfileProject, dataSource.createEntityManager());
  }

  async findByProfileId(profileId: string): Promise<ProfileProject[]> {
    return this.find({ where: { profileId } });
  }
}
