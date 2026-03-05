import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { UserJobNotification } from './entities/user-job-notification.entity';

@Injectable()
export class UserJobNotificationRepository extends BaseRepository<UserJobNotification> {
  constructor(dataSource: DataSource) {
    super(UserJobNotification, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<UserJobNotification[]> {
    return this.find({ where: { userId } });
  }

  async existsByUserAndJob(userId: string, jobId: string): Promise<boolean> {
    const count = await this.count({ where: { userId, jobId } });
    return count > 0;
  }
}
