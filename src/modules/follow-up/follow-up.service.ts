import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUp, FollowUpStatus, FollowUpType } from './entities/follow-up.entity';
import { GenerateFollowUpDto } from './dto/generate-follow-up.dto';
import { SendFollowUpDto } from './dto/send-follow-up.dto';
import { JobsService } from '../jobs/jobs.service';
import { ProfilesService } from '../profiles/profiles.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class FollowUpService {
    constructor(
        @InjectRepository(FollowUp)
        private followUpRepository: Repository<FollowUp>,
        private jobsService: JobsService,
        private profilesService: ProfilesService,
        private subscriptionService: SubscriptionService,
    ) { }

    async generate(userId: string, generateDto: GenerateFollowUpDto): Promise<FollowUp> {
        // Freemium Check
        const isPremium = await this.subscriptionService.isPremium(userId);
        if (!isPremium) {
            const followUpCount = await this.followUpRepository.count({ where: { userId } });
            if (followUpCount >= 1) {
                throw new ForbiddenException('Free users are limited to 1 AI Follow-up draft. Please upgrade to Premium for unlimited AI follow-ups.');
            }
        }
        const job = await this.jobsService.findOne(generateDto.jobId);
        if (!job) {
            throw new NotFoundException('Job not found');
        }

        const profile = await this.profilesService.findByUserId(userId);
        const name = profile.fullName || 'Candidate';
        const type = generateDto.type || FollowUpType.AFTER_APPLY;
        const tone = generateDto.tone || 'professional';

        // MOCK AI GENERATION
        let subject = '';
        let body = '';

        const greeting = tone === 'casual' ? 'Hi' : 'Dear';
        const closing = tone === 'casual' ? 'Best,' : 'Sincerely,';

        switch (type) {
            case FollowUpType.AFTER_APPLY:
                subject = `Following up on my application for ${job.title} - ${name}`;
                body = `${greeting} Hiring Manager,\n\nI hope this email finds you well.\n\nI recently applied for the ${job.title} position at ${job.company} and wanted to briefly reiterate my strong interest in the role. With my background in ${profile.skills?.[0] || 'the field'}, I am confident in my ability to contribute to your team.\n\nPlease let me know if you need any further information regarding my application.\n\n${closing}\n${name}\n${profile.phone || ''}`;
                break;
            case FollowUpType.AFTER_INTERVIEW:
                subject = `Thank you for the interview - ${job.title} - ${name}`;
                body = `${greeting} [Interviewer Name],\n\nThank you so much for the opportunity to interview for the ${job.title} role today. I enjoyed learning more about ${job.company} and discussing how my skills in ${profile.skills?.slice(0, 2).join(', ') || 'this area'} can help the team.\n\nI look forward to hearing from you regarding the next steps.\n\n${closing}\n${name}`;
                break;
            case FollowUpType.OFFER:
                subject = `Regarding the Offer for ${job.title}`;
                body = `${greeting} Hiring Team,\n\nThank you for offering me the position of ${job.title}. I am excited about the opportunity to join ${job.company}.\n\nBefore I sign, I would like to discuss... [AI Suggestion: Insert details]\n\n${closing}\n${name}`;
                break;
            default:
                subject = `Inquiry regarding ${job.title}`;
                body = `${greeting} Hiring Manager,\n\nI am writing to inquire about the status of my application for the ${job.title} position.\n\n${closing}\n${name}`;
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
