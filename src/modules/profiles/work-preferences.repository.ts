import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { WorkPreferences } from './entities/work-preferences.entity';

@Injectable()
export class WorkPreferencesRepository extends BaseRepository<WorkPreferences> {
  constructor(dataSource: DataSource) {
    super(WorkPreferences, dataSource.createEntityManager());
  }

  async findByProfileId(profileId: string): Promise<WorkPreferences | null> {
    return this.findOne({ where: { profileId } });
  }
}
