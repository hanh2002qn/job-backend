import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Job } from '../../jobs/entities/job.entity';

export enum FollowUpType {
    AFTER_APPLY = 'after_apply',
    AFTER_INTERVIEW = 'after_interview',
    CHECK_IN = 'check_in',
    OFFER = 'offer',
}

export enum FollowUpStatus {
    DRAFT = 'draft',
    SCHEDULED = 'scheduled',
    SENT = 'sent',
}

@Entity('follow_ups')
export class FollowUp {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'uuid' })
    jobId: string;

    @ManyToOne(() => Job, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'jobId' })
    job: Job;

    @Column({
        type: 'enum',
        enum: FollowUpType,
        default: FollowUpType.AFTER_APPLY,
    })
    type: FollowUpType;

    @Column({
        type: 'enum',
        enum: FollowUpStatus,
        default: FollowUpStatus.DRAFT,
    })
    status: FollowUpStatus;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'timestamp', nullable: true })
    scheduledAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
