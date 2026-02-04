import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { OriginalJobData } from '../../job-crawler/interfaces/job-crawler.interface';
import { City, Currency, Education, Gender, Industry, JobLevel, JobType } from '../enums/job.enums';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  source: string; // e.g., 'linkedIn', 'topcv'

  @Column()
  title: string;

  @Column()
  company: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  companyAddress: string;

  @Column({ nullable: true })
  companySize: string; // e.g., '100-499 employees'

  @Column({ nullable: true })
  workingTime: string; // e.g., 'Monday - Friday'

  @Column({ nullable: true })
  companyType: string; // e.g., 'Product', 'Outsource'

  @Column({ nullable: true })
  salaryMin: number;

  @Column({ nullable: true })
  salaryMax: number;

  @Column({ type: 'varchar', default: Currency.VND })
  currency: Currency;

  @Column({ type: 'varchar', nullable: true })
  jobType: JobType; // Remote, Onsite, Hybrid, Full-time...

  @Column({ type: 'varchar', nullable: true })
  experienceLevel: JobLevel; // Junior, Senior...

  @Column({ nullable: true })
  level: string; // Staff, Manager, Director...

  @Column({ nullable: true })
  category: string; // Industry/Category

  @Column({ type: 'simple-array', default: [] })
  categories: string[];

  @Column({ type: 'varchar', nullable: true })
  education: Education;

  @Column({ type: 'varchar', nullable: true })
  city: City;

  @Column({ default: false })
  isBranded: boolean;

  @Column({ type: 'simple-array', default: [] })
  tags: string[];

  @Column({ nullable: true })
  quantity: number; // Number of hires

  @Column({ type: 'varchar', nullable: true })
  gender: Gender; // Male/Female/Any

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date | null; // Application deadline

  @Column({ nullable: true })
  allowance: string;

  @Column({ nullable: true })
  equipment: string;

  @Column({ type: 'varchar', nullable: true })
  industry: Industry;

  @Column({ nullable: true })
  salary: string; // Original salary string

  @Column({ type: 'text', nullable: true })
  description: string; // Mô tả công việc

  @Column({ type: 'text', nullable: true })
  requirements: string; // Yêu cầu ứng viên

  @Column({ type: 'text', nullable: true })
  benefits: string; // Quyền lợi

  @Column({ type: 'simple-array', default: [] })
  skills: string[]; // Extracted skills for matching

  @Column({ type: 'jsonb', nullable: true, select: false })
  originalData: OriginalJobData; // Store full raw JSON from crawler if needed

  @Column({ default: false })
  expired: boolean;

  @Column({ type: 'varchar', nullable: true })
  externalId: string | null; // ID from the source system

  @Column({ nullable: true })
  url: string; // Ops: Link to original job

  @Column({ type: 'timestamp', nullable: true })
  postedAt: Date | null; // Date job was posted on source

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isAlertSent: boolean;

  // Full-text search vector (PostgreSQL tsvector)
  @Column({ type: 'tsvector', nullable: true, select: false })
  searchVector: string;

  // Expiration date (auto-calculated or from deadline)
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  // Content hash for deduplication (SHA256 of title+company+location)
  @Column({ type: 'varchar', length: 64, nullable: true })
  @Index()
  contentHash: string | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
