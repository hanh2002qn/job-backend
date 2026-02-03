import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Job } from '../../jobs/entities/job.entity';
import type { CvContent } from '../interfaces/cv.interface';

@Entity('cvs')
export class CV {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.cvs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  jobId: string;

  @ManyToOne(() => Job, { nullable: true })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column()
  name: string; // e.g., "CV for Google"

  @Column({ type: 'jsonb' })
  content: CvContent; // Structured CV data

  @Column({ nullable: true })
  template: string; // e.g., "modern", "classic"

  @Column({ nullable: true })
  score: number; // match score

  @CreateDateColumn()
  createdAt: Date;
}
