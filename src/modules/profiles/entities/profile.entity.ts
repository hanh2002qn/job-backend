import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EducationRecord, ExperienceRecord } from '../interfaces/profile.interface';

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

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'jsonb', default: [] })
  education: EducationRecord[];

  @Column({ type: 'jsonb', default: [] })
  experience: ExperienceRecord[];

  @Column({ type: 'simple-array', default: [] })
  skills: string[];

  @Column({ nullable: true })
  linkedin: string;

  @Column({ nullable: true })
  portfolio: string;

  // Job Preferences
  @Column({ type: 'simple-array', default: [] })
  preferredIndustries: string[];

  @Column({ type: 'simple-array', default: [] })
  preferredJobTypes: string[]; // e.g., ['Full-time', 'Remote']

  @Column({ type: 'simple-array', default: [] })
  preferredLocations: string[];

  @Column({ type: 'int', nullable: true })
  minSalaryExpectation: number;

  // CV Upload fields
  @Column({ type: 'varchar', nullable: true })
  cvUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  cvFileName: string | null;

  @Column({ type: 'varchar', nullable: true })
  cvS3Key: string | null;

  // Profile Completeness Score (0-100)
  @Column({ type: 'int', default: 0 })
  completenessScore: number;

  // Visibility Settings
  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @Column({ type: 'jsonb', default: DEFAULT_VISIBILITY })
  visibilitySettings: VisibilitySettings;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
