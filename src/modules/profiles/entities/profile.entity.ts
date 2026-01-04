import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('profiles')
export class Profile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: true })
    fullName: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    address: string;

    @Column({ type: 'jsonb', default: [] })
    education: Record<string, any>[];

    @Column({ type: 'jsonb', default: [] })
    experience: Record<string, any>[];

    @Column({ type: 'simple-array', default: [] })
    skills: string[];

    @Column({ nullable: true })
    linkedin: string;

    @Column({ nullable: true })
    portfolio: string;

    @UpdateDateColumn()
    updatedAt: Date;
}
