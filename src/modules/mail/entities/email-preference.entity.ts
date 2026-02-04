import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('email_preferences')
export class EmailPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
