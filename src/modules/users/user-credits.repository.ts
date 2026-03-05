import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { UserCredits } from './entities/user-credits.entity';

@Injectable()
export class UserCreditsRepository extends BaseRepository<UserCredits> {
  constructor(dataSource: DataSource) {
    super(UserCredits, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<UserCredits | null> {
    return this.findOne({ where: { userId } });
  }
}
