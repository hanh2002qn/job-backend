import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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
    salary: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'simple-array', default: [] })
    skills: string[]; // Extracted skills for matching

    @Column({ default: false })
    expired: boolean;

    @Column({ nullable: true })
    externalId: string; // ID from the source system

    @Column({ nullable: true })
    url: string; // Ops: Link to original job

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
