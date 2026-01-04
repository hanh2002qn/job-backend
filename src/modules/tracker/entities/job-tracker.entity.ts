import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Job } from '../../jobs/entities/job.entity';

export enum ApplicationStatus {
    SAVED = 'saved',
    APPLIED = 'applied',
    INTERVIEW = 'interview',
    OFFER = 'offer',
    REJECTED = 'rejected',
}

@Entity('job_trackers')
export class JobTracker {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @ManyToOne(() => User, (user) => user.trackers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'uuid' })
    jobId: string;

    @ManyToOne(() => Job, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'jobId' })
    job: Job;

    @Column({
        type: 'enum',
        enum: ApplicationStatus,
        default: ApplicationStatus.SAVED,
    })
    status: ApplicationStatus;

    @Column({ nullable: true })
    appliedAt: Date;

    @Column({ nullable: true })
    cvId: string;

    @ManyToOne('CV', { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'cvId' })
    cv: any; // Using any to avoid circular dependency for now, or import CV

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ nullable: true })
    nextActionDate: Date; // For reminders

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
