import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoverLetter } from './entities/cover-letter.entity';
import { GenerateCoverLetterDto } from './dto/generate-cover-letter.dto';
import { JobsService } from '../jobs/jobs.service';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class CoverLetterService {
    constructor(
        @InjectRepository(CoverLetter)
        private coverLettersRepository: Repository<CoverLetter>,
        private jobsService: JobsService,
        private profilesService: ProfilesService,
    ) { }

    async generate(userId: string, generateDto: GenerateCoverLetterDto): Promise<CoverLetter> {
        const job = await this.jobsService.findOne(generateDto.jobId);
        if (!job) {
            throw new NotFoundException('Job not found');
        }

        const profile = await this.profilesService.findByUserId(userId);
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        // MOCK AI GENERATION
        const tone = generateDto.tone || 'professional';
        const mockContent = `
[Your Name]
[Your Address]

[Date]

Hiring Manager
${job.company}

Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}.
With my background in ${profile.skills?.join(', ') || 'software development'}, I believe I can contribute effectively to your team.
(Tone: ${tone})

Sincerely,
[Your Name]
    `.trim();

        const coverLetter = this.coverLettersRepository.create({
            userId,
            jobId: job.id,
            content: mockContent,
            tone,
        });

        return this.coverLettersRepository.save(coverLetter);
    }

    async findAll(userId: string): Promise<CoverLetter[]> {
        return this.coverLettersRepository.find({
            where: { userId },
            relations: ['job'],
            order: { createdAt: 'DESC' },
        });
    }
}
