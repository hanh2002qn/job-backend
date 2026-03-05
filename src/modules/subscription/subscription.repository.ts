import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionRepository extends BaseRepository<Subscription> {
  constructor(dataSource: DataSource) {
    super(Subscription, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    return this.findOne({ where: { userId } });
  }

  async findByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
    return this.findOne({ where: { stripeSubscriptionId } });
  }
}
