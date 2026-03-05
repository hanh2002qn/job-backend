import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export interface PlanLimits {
  max_cvs: number;
  max_cover_letters: number;
  max_follow_ups: number;
  max_tracked_jobs: number;
  cv_templates: string[];
}

@Entity('plans')
export class Plan extends BaseEntity {
  @Column({ unique: true })
  slug: string; // 'free', 'premium_monthly', 'premium_yearly'

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', nullable: true })
  interval: 'month' | 'year' | null;

  @Column({ type: 'jsonb', default: {} })
  limits: PlanLimits;

  @Column({ default: true })
  isActive: boolean;
}
