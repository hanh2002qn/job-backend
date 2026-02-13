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
import {
  DataSource,
  SeniorityLevel,
  type SalaryRange,
  type AvoidPreferences,
} from '../interfaces/profile-enums';

@Entity('career_intents')
@Index(['profileId'], { unique: true })
export class CareerIntent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  profileId: string;

  @OneToOne(() => Profile, (profile) => profile.careerIntent, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  // Roles ready to apply now
  @Column({ type: 'jsonb', default: [] })
  applyNowRoles: string[];

  // Future target roles
  @Column({ type: 'jsonb', default: [] })
  targetRoles: string[];

  @Column({
    type: 'enum',
    enum: SeniorityLevel,
    nullable: true,
  })
  desiredSeniority: SeniorityLevel | null;

  @Column({ type: 'jsonb', nullable: true })
  salaryExpectation: SalaryRange | null;

  // startup | corporate | agency | non_profit
  @Column({ type: 'jsonb', default: [] })
  companyPreferences: string[];

  @Column({ type: 'jsonb', default: [] })
  industries: string[];

  // What to avoid
  @Column({
    type: 'jsonb',
    default: { roles: [], industries: [], skills: [] },
  })
  avoid: AvoidPreferences;

  @Column({
    type: 'enum',
    enum: DataSource,
    default: DataSource.USER,
  })
  source: DataSource;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  confidence: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
