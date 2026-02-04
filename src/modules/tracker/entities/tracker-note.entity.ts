import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JobTracker } from './job-tracker.entity';

@Entity('tracker_notes')
@Index(['trackerId', 'createdAt'])
export class TrackerNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  trackerId: string;

  @ManyToOne(() => JobTracker, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trackerId' })
  tracker: JobTracker;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
