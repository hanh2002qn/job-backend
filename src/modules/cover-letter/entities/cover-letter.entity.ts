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

@Entity('cover_letters')
export class CoverLetter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.coverLetters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  jobId: string;

  @ManyToOne(() => Job, { nullable: true })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 'professional' })
  tone: string; // professional, friendly, etc.

  @CreateDateColumn()
  createdAt: Date;
}
