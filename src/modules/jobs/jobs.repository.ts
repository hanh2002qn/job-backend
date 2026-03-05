import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Job } from './entities/job.entity';

@Injectable()
export class JobsRepository extends BaseRepository<Job> {
  constructor(dataSource: DataSource) {
    super(Job, dataSource.createEntityManager());
  }

  async findByExternalId(externalId: string, source: string): Promise<Job | null> {
    return this.findOne({ where: { externalId, source } });
  }

  async findByContentHash(contentHash: string): Promise<Job | null> {
    return this.findOne({ where: { contentHash } });
  }
}
