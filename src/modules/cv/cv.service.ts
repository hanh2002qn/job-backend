import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CV } from './entities/cv.entity';
import { GenerateCvDto } from './dto/generate-cv.dto';
import { JobsService } from '../jobs/jobs.service';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class CvService {
    constructor(
        @InjectRepository(CV)
        private cvRepository: Repository<CV>,
        private jobsService: JobsService,
        private profilesService: ProfilesService,
    ) { }

    async generate(userId: string, generateDto: GenerateCvDto): Promise<CV> {
        const job = await this.jobsService.findOne(generateDto.jobId);
        if (!job) {
            throw new NotFoundException('Job not found');
        }

        const profile = await this.profilesService.findByUserId(userId);
        if (!profile) {
            throw new NotFoundException('Profile not found. Please complete your profile first.');
        }

        // MOCK AI GENERATION LOGIC
        // Real implementation would call OpenAI/Claude here
        // based on profile + job description
        const mockCvContent = {
            personalInfo: { email: 'mock@user.com' },
            summary: `I am a great fit for ${job.title} at ${job.company}.`,
            experience: profile.experience,
            education: profile.education,
            matchedSkills: job.skills,
        };

        const cv = this.cvRepository.create({
            userId,
            jobId: job.id,
            name: `CV for ${job.title}`,
            content: mockCvContent,
            template: generateDto.template || 'standard',
            score: 85, // Mock score
        });

        return this.cvRepository.save(cv);
    }

    async findAll(userId: string): Promise<CV[]> {
        return this.cvRepository.find({
            where: { userId },
            relations: ['job'],
            order: { createdAt: 'DESC' },
        });
    }
}
