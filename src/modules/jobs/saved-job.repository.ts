import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { SavedJob } from './entities/saved-job.entity';

@Injectable()
export class SavedJobRepository extends BaseRepository<SavedJob> {
  constructor(dataSource: DataSource) {
    super(SavedJob, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<SavedJob[]> {
    return this.find({ where: { userId } });
  }

  async findByUserAndJob(userId: string, jobId: string): Promise<SavedJob | null> {
    return this.findOne({ where: { userId, jobId } });
  }
}
