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
import { DataSource, WorkMode, WorkingHours } from '../interfaces/profile-enums';

@Entity('work_preferences')
@Index(['profileId'], { unique: true })
export class WorkPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  profileId: string;

  @OneToOne(() => Profile, (profile) => profile.workPreferences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  @Column({ type: 'jsonb', default: [] })
  locations: string[];

  @Column({
    type: 'enum',
    enum: WorkMode,
    default: WorkMode.FLEXIBLE,
  })
  workMode: WorkMode;

  @Column({
    type: 'enum',
    enum: WorkingHours,
    default: WorkingHours.FLEXIBLE,
  })
  workingHours: WorkingHours;

  @Column({ type: 'jsonb', default: [] })
  languages: string[];

  @Column({ type: 'jsonb', default: [] })
  dealBreakers: string[];

  @Column({
    type: 'enum',
    enum: DataSource,
    default: DataSource.USER,
  })
  source: DataSource;

  @UpdateDateColumn()
  updatedAt: Date;
}
