import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Profile } from './profile.entity';

export enum InsightTrigger {
  CV_REJECTED = 'cv_rejected',
  JOB_SAVED = 'job_saved',
  INTERVIEW_FAILED = 'interview_failed',
  PROFILE_INCOMPLETE = 'profile_incomplete',
  SKILL_GAP_DETECTED = 'skill_gap_detected',
}

@Entity('profile_insights')
@Index(['profileId', 'trigger'])
export class ProfileInsight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => Profile, (profile: Profile) => profile.insights, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  @Column({
    type: 'enum',
    enum: InsightTrigger,
  })
  trigger: InsightTrigger;

  @Column({ type: 'text' })
  insight: string;

  @Column({ type: 'text' })
  suggestedAction: string;

  // JSON array of profile field IDs that this insight relates to
  @Column({ type: 'jsonb', default: [] })
  relatedProfileFields: string[];

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'boolean', default: false })
  isActioned: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
