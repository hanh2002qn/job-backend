import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Profile } from './profile.entity';
import { DataSource, EmploymentType, WorkScope, Responsibility } from '../interfaces/profile-enums';

@Entity('profile_experiences')
@Index(['profileId', 'organization'])
export class ProfileExperience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => Profile, (profile) => profile.profileExperiences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  @Column({ type: 'varchar', length: 255 })
  organization: string;

  @Column({ type: 'varchar', length: 255 })
  role: string;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
  })
  employmentType: EmploymentType;

  @Column({ type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ type: 'jsonb', default: [] })
  responsibilities: Responsibility[];

  @Column({
    type: 'enum',
    enum: WorkScope,
    default: WorkScope.INDIVIDUAL,
  })
  scope: WorkScope;

  @Column({ type: 'uuid', array: true, default: [] })
  skillsUsed: string[];

  @Column({
    type: 'enum',
    enum: DataSource,
    default: DataSource.USER,
  })
  source: DataSource;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  confidence: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
