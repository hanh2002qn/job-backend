import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { JobAlert } from './entities/job-alert.entity';

@Injectable()
export class JobAlertRepository extends BaseRepository<JobAlert> {
  constructor(dataSource: DataSource) {
    super(JobAlert, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<JobAlert | null> {
    return this.findOne({ where: { userId } });
  }

  async findAllActive(): Promise<JobAlert[]> {
    return this.find({ where: { isActive: true } });
  }
}
