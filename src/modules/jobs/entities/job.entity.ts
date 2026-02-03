import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { OriginalJobData } from '../../job-crawler/interfaces/job-crawler.interface';

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

  @Column({ default: 'VND' })
  currency: string;

  @Column({ nullable: true })
  jobType: string; // Remote, Onsite, Hybrid, Full-time...

  @Column({ nullable: true })
  experienceLevel: string; // Junior, Senior...

  @Column({ nullable: true })
  level: string; // Staff, Manager, Director...

  @Column({ nullable: true })
  category: string; // Industry/Category

  @Column({ type: 'simple-array', default: [] })
  categories: string[];

  @Column({ nullable: true })
  education: string;

  @Column({ nullable: true })
  city: string;

  @Column({ default: false })
  isBranded: boolean;

  @Column({ type: 'simple-array', default: [] })
  tags: string[];

  @Column({ nullable: true })
  quantity: number; // Number of hires

  @Column({ nullable: true })
  gender: string; // Male/Female/Any

  @Column({ nullable: true })
  deadline: Date | null; // Application deadline

  @Column({ nullable: true })
  allowance: string;

  @Column({ nullable: true })
  equipment: string;

  @Column({ nullable: true })
  industry: string;

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

  @Column({ nullable: true })
  externalId: string | null; // ID from the source system

  @Column({ nullable: true })
  url: string; // Ops: Link to original job

  @Column({ nullable: true })
  postedAt: Date | null; // Date job was posted on source

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isAlertSent: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
