import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', nullable: true })
  rating: number; // 1-5 stars

  @Column({ type: 'varchar', nullable: true })
  category: string; // e.g., 'Bug', 'Feature Request', 'General'

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @Column({ type: 'varchar', nullable: true })
  contactEmail: string; // If user is not logged in or wants response elsewhere

  @Column({ default: false })
  isResolved: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
