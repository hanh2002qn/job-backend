import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { AiUsage } from './entities/ai-usage.entity';

@Injectable()
export class AiUsageRepository extends BaseRepository<AiUsage> {
  constructor(dataSource: DataSource) {
    super(AiUsage, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<AiUsage[]> {
    return this.find({ where: { userId } });
  }

  async findByFeature(feature: string): Promise<AiUsage[]> {
    return this.find({ where: { feature } });
  }
}
