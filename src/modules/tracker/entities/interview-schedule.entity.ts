import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobTracker } from './job-tracker.entity';

export enum InterviewType {
  TECHNICAL = 'technical',
  HR = 'hr',
  CULTURAL = 'cultural',
  SYSTEM_DESIGN = 'system_design',
  CODING = 'coding',
  OTHER = 'other',
}

@Entity('interview_schedules')
export class InterviewSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  trackerId: string;

  @ManyToOne(() => JobTracker, (tracker) => tracker.interviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trackerId' })
  tracker: JobTracker;

  @Column()
  roundName: string; // e.g., "Round 1: Technical Interview"

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({
    type: 'enum',
    enum: InterviewType,
    default: InterviewType.OTHER,
  })
  type: InterviewType;

  @Column({ nullable: true })
  locationUrl: string; // Meeting link or office address

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  prepTips: Record<string, unknown> | null; // AI generated tips

  // Google Calendar sync fields
  @Column({ type: 'varchar', nullable: true })
  googleEventId: string | null;

  @Column({ type: 'timestamp', nullable: true })
  calendarSyncedAt: Date | null;

  // Interview duration in minutes (for calendar event)
  @Column({ type: 'int', default: 60 })
  durationMinutes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
