import { Injectable } from '@nestjs/common';
import { DataSource, FindManyOptions } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { JobTracker } from './entities/job-tracker.entity';

@Injectable()
export class JobTrackerRepository extends BaseRepository<JobTracker> {
  constructor(dataSource: DataSource) {
    super(JobTracker, dataSource.createEntityManager());
  }

  async findByUserId(userId: string, relations?: string[]): Promise<JobTracker[]> {
    const options: FindManyOptions<JobTracker> = { where: { userId } };
    if (relations && relations.length > 0) {
      options.relations = relations;
    }
    return this.find(options);
  }
}
