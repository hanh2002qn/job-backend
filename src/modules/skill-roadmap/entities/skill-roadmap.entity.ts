import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('skill_roadmaps')
export class SkillRoadmap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.skillRoadmaps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  targetGoal: string; // e.g., "Senior Fullstack Developer", or a specific Job ID

  @Column({ type: 'jsonb' })
  roadmapData: Record<string, unknown>; // Structured roadmap from AI

  @CreateDateColumn()
  createdAt: Date;
}
