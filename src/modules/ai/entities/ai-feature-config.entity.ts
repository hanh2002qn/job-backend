import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('ai_feature_configs')
export class AiFeatureConfig extends BaseEntity {
  @Column({ unique: true })
  featureKey: string; // e.g. 'cv_parsing', 'mock_interview'

  @Column()
  displayName: string; // e.g. 'CV Parsing'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ type: 'int', default: 0 })
  maxRequestsPerDay: number; // 0 = unlimited

  @Column({ type: 'jsonb', nullable: true })
  tierQuotas: Record<string, number>; // e.g. { "free": 5, "premium_monthly": 50 }
}
