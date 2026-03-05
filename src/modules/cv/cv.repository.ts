import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { CV } from './entities/cv.entity';

@Injectable()
export class CvRepository extends BaseRepository<CV> {
  constructor(dataSource: DataSource) {
    super(CV, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<CV[]> {
    return this.find({ where: { userId } });
  }
}
