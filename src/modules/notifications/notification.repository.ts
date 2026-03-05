import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationRepository extends BaseRepository<Notification> {
  constructor(dataSource: DataSource) {
    super(Notification, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.find({ where: { userId } });
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    return this.find({ where: { userId, read: false } });
  }
}
