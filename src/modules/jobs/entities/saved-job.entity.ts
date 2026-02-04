import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Job } from './job.entity';

@Entity('saved_jobs')
@Unique(['userId', 'jobId'])
@Index(['userId'])
export class SavedJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  jobId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @CreateDateColumn()
  savedAt: Date;
}
