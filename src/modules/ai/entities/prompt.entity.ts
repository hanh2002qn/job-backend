import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum PromptCategory {
  CV = 'CV',
  JOB = 'JOB',
  INTERVIEW = 'INTERVIEW',
  OTHER = 'OTHER',
}

@Entity('prompts')
export class Prompt extends BaseEntity {
  @Column({ unique: true })
  key: string; // e.g., 'CV_GENERATION_SUMMARY'

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PromptCategory,
    default: PromptCategory.OTHER,
  })
  category: PromptCategory;

  @Column({ default: true })
  isActive: boolean;
}
