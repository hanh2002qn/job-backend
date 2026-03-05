import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('email_preferences')
export class EmailPreference extends BaseEntity {
  @Column()
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: true })
  jobAlerts: boolean;

  @Column({ default: true })
  applicationReminders: boolean;

  @Column({ default: true })
  marketing: boolean;
}
