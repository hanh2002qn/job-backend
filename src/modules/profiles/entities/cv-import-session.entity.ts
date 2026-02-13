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
import { ImportStatus, type ParsedFields } from '../interfaces/profile-enums';

@Entity('cv_import_sessions')
@Index(['profileId', 'status'])
export class CvImportSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => Profile, (profile) => profile.cvImportSessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  // Raw extracted text from CV
  @Column({ type: 'text' })
  rawText: string;

  // Parsed and structured data
  @Column({
    type: 'jsonb',
    default: { skills: [], experiences: [], projects: [] },
  })
  parsedFields: ParsedFields;

  // Field paths that need user review
  @Column({ type: 'jsonb', default: [] })
  lowConfidenceFields: string[];

  @Column({
    type: 'enum',
    enum: ImportStatus,
    default: ImportStatus.PARSED,
  })
  status: ImportStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt: Date | null;
}
