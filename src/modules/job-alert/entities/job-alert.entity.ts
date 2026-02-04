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

export enum AlertFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

export enum AlertChannel {
  EMAIL = 'email',
  PUSH = 'push',
}

@Entity('job_alerts')
export class JobAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.jobAlert, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: AlertFrequency,
    default: AlertFrequency.DAILY,
  })
  frequency: AlertFrequency;

  // Storing as array of strings for simplicity in Postgres
  @Column('simple-array', { default: [AlertChannel.EMAIL] })
  channels: AlertChannel[];

  @Column({ type: 'timestamp', nullable: true })
  lastSentAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
