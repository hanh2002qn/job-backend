import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { CvVersion } from './entities/cv-version.entity';

@Injectable()
export class CvVersionRepository extends BaseRepository<CvVersion> {
  constructor(dataSource: DataSource) {
    super(CvVersion, dataSource.createEntityManager());
  }

  async findByCvId(cvId: string): Promise<CvVersion[]> {
    return this.find({ where: { cvId }, order: { versionNumber: 'DESC' } });
  }
}
