import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { CrawlerConfig } from './entities/crawler-config.entity';

@Injectable()
export class CrawlerConfigRepository extends BaseRepository<CrawlerConfig> {
  constructor(dataSource: DataSource) {
    super(CrawlerConfig, dataSource.createEntityManager());
  }

  async findBySource(source: string): Promise<CrawlerConfig | null> {
    return this.findOne({ where: { source } });
  }

  async findAllActive(): Promise<CrawlerConfig[]> {
    return this.find({ where: { isActive: true } });
  }
}
