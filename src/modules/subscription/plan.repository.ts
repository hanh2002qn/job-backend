import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Plan } from './entities/plan.entity';

@Injectable()
export class PlanRepository extends BaseRepository<Plan> {
  constructor(dataSource: DataSource) {
    super(Plan, dataSource.createEntityManager());
  }

  async findBySlug(slug: string): Promise<Plan | null> {
    return this.findOne({ where: { slug } });
  }

  async findAllActive(): Promise<Plan[]> {
    return this.find({ where: { isActive: true } });
  }
}
