import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { EmailPreference } from './entities/email-preference.entity';

@Injectable()
export class EmailPreferenceRepository extends BaseRepository<EmailPreference> {
  constructor(dataSource: DataSource) {
    super(EmailPreference, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<EmailPreference | null> {
    return this.findOne({ where: { userId } });
  }
}
