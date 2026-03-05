import { Injectable } from '@nestjs/common';
import { DataSource, FindManyOptions } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfileRepository extends BaseRepository<Profile> {
  constructor(dataSource: DataSource) {
    super(Profile, dataSource.createEntityManager());
  }

  async findByUserId(userId: string, relations?: string[]): Promise<Profile | null> {
    const options: FindManyOptions<Profile> = { where: { userId } };
    if (relations && relations.length > 0) {
      options.relations = relations;
    }
    return this.findOne(options as Parameters<typeof this.findOne>[0]);
  }
}
