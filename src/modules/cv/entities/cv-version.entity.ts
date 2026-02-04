import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { CV } from './cv.entity';
import type { CvContent } from '../interfaces/cv.interface';

@Entity('cv_versions')
export class CvVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  cvId: string;

  @ManyToOne(() => CV, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cvId' })
  cv: CV;

  @Column({ type: 'int' })
  versionNumber: number;

  @Column({ type: 'jsonb' })
  content: CvContent;

  @CreateDateColumn()
  createdAt: Date;
}
