import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { FollowUp } from './entities/follow-up.entity';

@Injectable()
export class FollowUpRepository extends BaseRepository<FollowUp> {
  constructor(dataSource: DataSource) {
    super(FollowUp, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<FollowUp[]> {
    return this.find({ where: { userId } });
  }

  async findByTrackingToken(trackingToken: string): Promise<FollowUp | null> {
    return this.findOne({ where: { trackingToken } });
  }
}
