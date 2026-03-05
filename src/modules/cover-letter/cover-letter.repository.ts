import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { CoverLetter } from './entities/cover-letter.entity';

@Injectable()
export class CoverLetterRepository extends BaseRepository<CoverLetter> {
  constructor(dataSource: DataSource) {
    super(CoverLetter, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<CoverLetter[]> {
    return this.find({ where: { userId } });
  }
}
