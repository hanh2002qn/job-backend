import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Profile } from './profile.entity';
import { DataSource, ProjectContext } from '../interfaces/profile-enums';

@Entity('profile_projects')
@Index(['profileId'])
export class ProfileProject extends BaseEntity {
  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => Profile, (profile) => profile.profileProjects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: ProjectContext,
    default: ProjectContext.PERSONAL,
  })
  context: ProjectContext;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  role: string | null;

  @Column({ type: 'uuid', array: true, default: [] })
  skillsUsed: string[];

  @Column({ type: 'jsonb', default: [] })
  outcomes: string[];

  @Column({
    type: 'enum',
    enum: DataSource,
    default: DataSource.USER,
  })
  source: DataSource;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  confidence: number;
}
