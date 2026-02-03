import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';
import { JobTracker } from '../../tracker/entities/job-tracker.entity';
import { CV } from '../../cv/entities/cv.entity';
import { CoverLetter } from '../../cover-letter/entities/cover-letter.entity';
import { SkillRoadmap } from '../../skill-roadmap/entities/skill-roadmap.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash: string | null;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationToken: string | null;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => JobTracker, (tracker) => tracker.user)
  trackers: JobTracker[];

  @OneToMany(() => CV, (cv) => cv.user)
  cvs: CV[];

  @OneToMany(() => CoverLetter, (cl) => cl.user)
  coverLetters: CoverLetter[];

  @OneToMany(() => SkillRoadmap, (roadmap) => roadmap.user)
  skillRoadmaps: SkillRoadmap[];
}
