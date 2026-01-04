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

    @Column({ type: 'jsonb', default: [] })
    education: Record<string, any>[];

    @Column({ type: 'jsonb', default: [] })
    experience: Record<string, any>[];

    @Column({ type: 'simple-array', default: [] })
    skills: string[];

    @UpdateDateColumn()
    updatedAt: Date;
}
