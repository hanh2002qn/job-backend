import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('system_settings')
export class SystemSetting extends BaseEntity {
  @Column({ unique: true })
  key: string;

  @Column({ type: 'jsonb' })
  // Using unknown instead of any to satisfy strict type safety rules. JSONB can store primitives or objects.
  value: unknown;

  @Column({ type: 'text', nullable: true })
  description: string;
}
