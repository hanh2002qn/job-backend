import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('ai_usages')
export class AiUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string; // Nullable for system usage or anonymous

  @Column()
  feature: string; // 'cv_generate', 'mock_interview'

  @Column()
  model: string; // 'gemini-flash', 'gemini-pro'

  @Column({ type: 'int', default: 0 })
  inputTokens: number;

  @Column({ type: 'int', default: 0 })
  outputTokens: number;

  @Column({ type: 'int', default: 0 })
  totalTokens: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  cost: number;

  @CreateDateColumn()
  createdAt: Date;
}
