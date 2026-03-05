import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { CareerIntent } from './entities/career-intent.entity';

@Injectable()
export class CareerIntentRepository extends BaseRepository<CareerIntent> {
  constructor(dataSource: DataSource) {
    super(CareerIntent, dataSource.createEntityManager());
  }

  async findByProfileId(profileId: string): Promise<CareerIntent | null> {
    return this.findOne({ where: { profileId } });
  }
}
