import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { CvImportSession } from './entities/cv-import-session.entity';

@Injectable()
export class CvImportSessionRepository extends BaseRepository<CvImportSession> {
  constructor(dataSource: DataSource) {
    super(CvImportSession, dataSource.createEntityManager());
  }

  async findByProfileId(profileId: string): Promise<CvImportSession[]> {
    return this.find({ where: { profileId }, order: { createdAt: 'DESC' } });
  }
}
