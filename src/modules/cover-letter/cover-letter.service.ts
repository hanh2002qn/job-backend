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
        const candidateName = profile.fullName || 'Candidate';
        const candidateAddress = profile.address || 'Candidate Address';

        const mockContent = `
${candidateName}
${candidateAddress}
${profile.user?.email || 'email@example.com'}
${profile.phone || 'Phone Number'}

${new Date().toLocaleDateString()}

Hiring Manager
${job.company}

Dear Hiring Manager,

I am writing to express my enthusiastic interest in the ${job.title} position at ${job.company}, as advertised on ${job.source}.

With my solid background in ${profile.skills?.slice(0, 3).join(', ') || 'software development'}, I am confident in my ability to contribute effectively to your team. I have ${profile.experience?.length || 0} years of relevant experience, specifically in delivering high-quality results.

I was particularly drawn to this role because of ${job.company}'s reputation for innovation. I am eager to bring my expertise in ${profile.skills ? profile.skills[0] : 'core skills'} to help your team achieve its goals.

Thank you for considering my application. I look forward to the possibility of discussing how my skills align with your needs.

Sincerely,

${candidateName}
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
