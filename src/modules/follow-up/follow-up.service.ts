import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUp, FollowUpStatus, FollowUpType } from './entities/follow-up.entity';
import { GenerateFollowUpDto } from './dto/generate-follow-up.dto';
import { SendFollowUpDto } from './dto/send-follow-up.dto';
import { JobsService } from '../jobs/jobs.service';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class FollowUpService {
    constructor(
        @InjectRepository(FollowUp)
        private followUpRepository: Repository<FollowUp>,
        private jobsService: JobsService,
        private profilesService: ProfilesService,
    ) { }

    async generate(userId: string, generateDto: GenerateFollowUpDto): Promise<FollowUp> {
        const job = await this.jobsService.findOne(generateDto.jobId);
        if (!job) {
            throw new NotFoundException('Job not found');
        }

        const type = generateDto.type || FollowUpType.AFTER_APPLY;

        // MOCK AI GENERATION
        let subject = '';
        let body = '';

        if (type === FollowUpType.AFTER_APPLY) {
            subject = `Following up on my application for ${job.title}`;
            body = `Dear Hiring Manager,\n\nI recently applied for the ${job.title} position...`;
        } else if (type === FollowUpType.AFTER_INTERVIEW) {
            subject = `Thank you for the interview - ${job.title}`;
            body = `Dear [Interviewer Name],\n\nThank you for the opportunity to interview today...`;
        }

        const followUp = this.followUpRepository.create({
            userId,
            jobId: job.id,
            type,
            content: JSON.stringify({ subject, body }),
            status: FollowUpStatus.DRAFT,
        });

        return this.followUpRepository.save(followUp);
    }

    async sendOrSchedule(userId: string, sendDto: SendFollowUpDto): Promise<FollowUp> {
        const followUp = await this.followUpRepository.findOne({ where: { id: sendDto.followUpId, userId } });
        if (!followUp) {
            throw new NotFoundException('Follow-up draft not found');
        }

        if (sendDto.scheduledAt) {
            followUp.scheduledAt = new Date(sendDto.scheduledAt);
            followUp.status = FollowUpStatus.SCHEDULED;
        } else {
            // Mock Send Immediately
            followUp.status = FollowUpStatus.SENT;
            followUp.scheduledAt = new Date();
            console.log(`[MOCK EMAIL SENT] To: Company of Job ${followUp.jobId}, Content: ${followUp.content}`);
        }

        return this.followUpRepository.save(followUp);
    }
}
