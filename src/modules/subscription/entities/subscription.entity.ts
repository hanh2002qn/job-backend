import { Entity, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Plan } from './plan.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
}

@Entity('subscriptions')
export class Subscription extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  planId: string | null;

  @ManyToOne(() => Plan, { eager: true })
  @JoinColumn({ name: 'planId' })
  planDetails: Plan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: false })
  cancelAtPeriodEnd: boolean;

  /**
   * Helper: get the plan slug (e.g., 'free', 'premium_monthly', 'premium_yearly')
   */
  get planSlug(): string {
    return this.planDetails?.slug || 'free';
  }

  /**
   * Helper: check if this subscription is on a premium plan
   */
  get isPremiumPlan(): boolean {
    return this.planSlug.startsWith('premium_');
  }
}
