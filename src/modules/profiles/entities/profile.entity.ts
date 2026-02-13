import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProfileSkill } from './profile-skill.entity';
import { ProfileExperience } from './profile-experience.entity';
import { ProfileProject } from './profile-project.entity';
import { CareerIntent } from './career-intent.entity';
import { WorkPreferences } from './work-preferences.entity';
import { CvImportSession } from './cv-import-session.entity';
import { ProfileMetadata } from './profile-metadata.entity';
import { ProfileInsight } from './profile-insight.entity';
import { DataSource, SeniorityLevel, WorkMode } from '../interfaces/profile-enums';
import type { EducationRecord, ExperienceRecord } from '../interfaces/profile.interface';

export interface VisibilitySettings {
  showEmail: boolean;
  showPhone: boolean;
  showSalary: boolean;
  showSocials: boolean;
}

const DEFAULT_VISIBILITY: VisibilitySettings = {
  showEmail: false,
  showPhone: false,
  showSalary: false,
  showSocials: true,
};

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // ============ Overview Fields (profile_overview from spec) ============
  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  currentRole: string;

  @Column({
    type: 'enum',
    enum: SeniorityLevel,
    nullable: true,
  })
  seniorityLevel: SeniorityLevel | null;

  @Column({ type: 'int', nullable: true })
  yearsOfExperience: number | null;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({
    type: 'enum',
    enum: WorkMode,
    nullable: true,
  })
  workPreference: WorkMode | null;

  // Source tracking for overview
  @Column({
    type: 'enum',
    enum: DataSource,
    default: DataSource.USER,
  })
  source: DataSource;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  confidence: number;

  // ============ Social Links ============
  @Column({ nullable: true })
  linkedin: string;

  @Column({ nullable: true })
  portfolio: string;

  // ============ CV Upload fields ============
  @Column({ type: 'varchar', nullable: true })
  cvUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  cvFileName: string | null;

  @Column({ type: 'varchar', nullable: true })
  cvS3Key: string | null;

  // ============ Visibility Settings ============
  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @Column({ type: 'jsonb', default: DEFAULT_VISIBILITY })
  visibilitySettings: VisibilitySettings;

  // ============ Relations to new entities ============
  @OneToMany(() => ProfileSkill, (skill) => skill.profile, { cascade: true })
  profileSkills: ProfileSkill[];

  @OneToMany(() => ProfileExperience, (exp) => exp.profile, { cascade: true })
  profileExperiences: ProfileExperience[];

  @OneToMany(() => ProfileProject, (project) => project.profile, {
    cascade: true,
  })
  profileProjects: ProfileProject[];

  @OneToOne(() => CareerIntent, (intent) => intent.profile, { cascade: true })
  careerIntent: CareerIntent;

  @OneToOne(() => WorkPreferences, (prefs) => prefs.profile, { cascade: true })
  workPreferences: WorkPreferences;

  @OneToMany(() => CvImportSession, (session) => session.profile)
  cvImportSessions: CvImportSession[];

  @OneToOne(() => ProfileMetadata, (metadata) => metadata.profile, {
    cascade: true,
  })
  metadata: ProfileMetadata;

  @OneToMany(() => ProfileInsight, (insight) => insight.profile)
  insights: ProfileInsight[];

  // ============ Timestamps ============
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ============ DEPRECATED: Legacy fields (kept for migration) ============
  /** @deprecated Use profileSkills instead */
  @Column({ type: 'simple-array', default: [], select: false })
  skills: string[];

  /** @deprecated Use profileExperiences instead */
  @Column({ type: 'jsonb', default: [], select: false })
  experience: ExperienceRecord[];

  /** @deprecated Use separate entities instead */
  @Column({ type: 'jsonb', default: [], select: false })
  education: EducationRecord[];

  /** @deprecated Use careerIntent.industries instead */
  @Column({ type: 'simple-array', default: [], select: false })
  preferredIndustries: string[];

  /** @deprecated Use workPreferences instead */
  @Column({ type: 'simple-array', default: [], select: false })
  preferredJobTypes: string[];

  /** @deprecated Use workPreferences.locations instead */
  @Column({ type: 'simple-array', default: [], select: false })
  preferredLocations: string[];

  /** @deprecated Use careerIntent.salaryExpectation instead */
  @Column({ type: 'int', nullable: true, select: false })
  minSalaryExpectation: number;

  /** @deprecated Use ProfileCompletenessService for goal-based scoring */
  @Column({ type: 'int', default: 0, select: false })
  completenessScore: number;
}
