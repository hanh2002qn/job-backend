import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Job } from '../../jobs/entities/job.entity';

export enum InterviewStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('mock_interviews')
export class MockInterview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ nullable: true })
  jobId: string;

  @ManyToOne(() => Job, { nullable: true })
  job: Job;

  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.IN_PROGRESS,
  })
  status: InterviewStatus;

  @Column({ type: 'text', nullable: true })
  evaluation: string;

  @Column({ type: 'int', nullable: true })
  overallScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => InterviewMessage, (message) => message.interview, { cascade: true })
  messages: InterviewMessage[];
}

@Entity('interview_messages')
export class InterviewMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  interviewId: string;

  @ManyToOne(() => MockInterview, (interview) => interview.messages)
  interview: MockInterview;

  @Column({ type: 'enum', enum: ['ai', 'user'] })
  role: 'ai' | 'user';

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  feedback: string; // AI feedback on user's answer

  @Column({ type: 'int', nullable: true })
  score: number; // Score for this specific answer

  @CreateDateColumn()
  createdAt: Date;
}
