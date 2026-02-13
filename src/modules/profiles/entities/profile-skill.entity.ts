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
import {
  DataSource,
  SkillCategory,
  SkillLevel,
  SkillContext,
  SkillEvidence,
} from '../interfaces/profile-enums';

@Entity('profile_skills')
@Index(['profileId', 'name'])
export class ProfileSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => Profile, (profile) => profile.profileSkills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: SkillCategory,
    default: SkillCategory.PROFESSIONAL,
  })
  category: SkillCategory;

  @Column({
    type: 'enum',
    enum: SkillLevel,
    default: SkillLevel.USED_BEFORE,
  })
  level: SkillLevel;

  @Column({ type: 'jsonb', default: [] })
  contexts: SkillContext[];

  @Column({ type: 'jsonb', default: [] })
  evidence: SkillEvidence[];

  @Column({
    type: 'enum',
    enum: DataSource,
    default: DataSource.USER,
  })
  source: DataSource;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  confidence: number;

  @Column({ type: 'int', nullable: true })
  lastUsedYear: number | null;

  @Column({ type: 'boolean', default: false })
  possibleDuplicate: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
