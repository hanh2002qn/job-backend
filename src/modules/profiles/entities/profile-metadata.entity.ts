import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Profile } from './profile.entity';
import type { UsageStats } from '../interfaces/profile-enums';

@Entity('profile_metadata')
@Index(['profileId'], { unique: true })
export class ProfileMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  profileId: string;

  @OneToOne(() => Profile, (profile) => profile.metadata, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  // Usage tracking for AI features
  @Column({
    type: 'jsonb',
    default: { cvGenerated: 0, jobMatched: 0, mockInterview: 0 },
  })
  usedFor: UsageStats;

  @Column({ type: 'timestamp', nullable: true })
  lastAiAnalysis: Date | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
