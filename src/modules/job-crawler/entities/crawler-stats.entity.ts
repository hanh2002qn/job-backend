import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export type CrawlerStatus = 'success' | 'partial' | 'failed';

@Entity('crawler_stats')
@Index(['source', 'runAt'])
export class CrawlerStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  source: string;

  @CreateDateColumn()
  runAt: Date;

  @Column({ type: 'int', default: 0 })
  jobsFound: number;

  @Column({ type: 'int', default: 0 })
  jobsCreated: number;

  @Column({ type: 'int', default: 0 })
  jobsUpdated: number;

  @Column({ type: 'int', default: 0 })
  jobsSkipped: number;

  @Column({ type: 'int', default: 0 })
  duplicatesSkipped: number;

  @Column({ type: 'int', default: 0 })
  errors: number;

  @Column({ type: 'int', default: 0 })
  durationMs: number;

  @Column({ type: 'varchar', length: 20, default: 'success' })
  status: CrawlerStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;
}
