import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { AiFeatureConfig } from './entities/ai-feature-config.entity';

@Injectable()
export class AiFeatureConfigRepository extends BaseRepository<AiFeatureConfig> {
  constructor(dataSource: DataSource) {
    super(AiFeatureConfig, dataSource.createEntityManager());
  }

  async findByFeatureKey(featureKey: string): Promise<AiFeatureConfig | null> {
    return this.findOne({ where: { featureKey } });
  }

  async findAllEnabled(): Promise<AiFeatureConfig[]> {
    return this.find({ where: { isEnabled: true } });
  }
}
