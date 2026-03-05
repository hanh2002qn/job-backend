import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { CrawlerStats } from './entities/crawler-stats.entity';

@Injectable()
export class CrawlerStatsRepository extends BaseRepository<CrawlerStats> {
  constructor(dataSource: DataSource) {
    super(CrawlerStats, dataSource.createEntityManager());
  }

  async findBySource(source: string): Promise<CrawlerStats[]> {
    return this.find({ where: { source }, order: { runAt: 'DESC' } });
  }
}
