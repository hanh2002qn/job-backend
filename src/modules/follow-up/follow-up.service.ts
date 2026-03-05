import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { Subscription } from '../subscription/entities/subscription.entity';
import { FollowUp, FollowUpStatus, FollowUpType } from './entities/follow-up.entity';
import { FollowUpRepository } from './follow-up.repository';
import { GenerateFollowUpDto } from './dto/generate-follow-up.dto';
import { SendFollowUpDto } from './dto/send-follow-up.dto';
import { JobsService } from '../jobs/jobs.service';
import { ProfilesService } from '../profiles/profiles.service';
import { SubscriptionService } from '../subscription/subscription.service';

import { v4 as uuidv4 } from 'uuid';
import { LLM_SERVICE, type LlmService } from '../ai/llm.interface';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';

@Injectable()
export class FollowUpService {
  constructor(
    private followUpRepository: FollowUpRepository,
    private jobsService: JobsService,
    private profilesService: ProfilesService,
    private subscriptionService: SubscriptionService,
    @Inject(LLM_SERVICE) private llmService: LlmService,
  ) {}

  async generate(
    userId: string,
    generateDto: GenerateFollowUpDto,
    subscription?: Subscription,
  ): Promise<FollowUp> {
    const sub = subscription || (await this.subscriptionService.getSubscription(userId));
    if (!sub) {
      throw new NotFoundException('Subscription not found');
    }
    const job = await this.jobsService.findOne(generateDto.jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const profile = await this.profilesService.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException(
        'Profile not found. Please update your profile before generating a follow-up.',
      );
    }

    const type = generateDto.type || FollowUpType.AFTER_APPLY;
    const tone = generateDto.tone || 'professional';

    const prompt = `
      You are an expert career coach helping a candidate write a follow-up email.
      
      Candidate Info:
      - Name: ${profile.fullName}
      - Skills: ${profile.skills?.join(', ')}
      
      Job Info:
      - Title: ${job.title}
      - Company: ${job.company}
      - Description: ${job.description}
      
      Instructions:
      1. Write a compelling follow-up email of type "${type}" with a "${tone}" tone.
      2. The email should be concise, professional, and highlight the candidate's fit.
      3. Return ONLY valid JSON with 'subject' and 'body' fields.
    `;

    const aiResponse = await this.llmService.generateJson<{ subject: string; body: string }>(
      prompt,
    );

    const followUp = this.followUpRepository.create({
      userId,
      jobId: job.id,
      type,
      content: JSON.stringify(aiResponse),
      status: FollowUpStatus.DRAFT,
      trackingToken: uuidv4(),
    });

    const savedFollowUp = await this.followUpRepository.save(followUp);

    // Increment usage after successful generation
    if (sub) {
      await this.subscriptionService.incrementUsage(sub.id, 'followUpUsage');
    }

    return savedFollowUp;
  }

  async update(userId: string, id: string, updateDto: UpdateFollowUpDto): Promise<FollowUp> {
    const followUp = await this.followUpRepository.findOne({
      where: { id, userId },
    });

    if (!followUp) {
      throw new NotFoundException('Follow-up draft not found');
    }

    if (followUp.status !== FollowUpStatus.DRAFT) {
      throw new ForbiddenException('Only drafts can be edited');
    }

    followUp.content = updateDto.content;
    return this.followUpRepository.save(followUp);
  }

  async sendOrSchedule(userId: string, sendDto: SendFollowUpDto): Promise<FollowUp> {
    const followUp = await this.followUpRepository.findOne({
      where: { id: sendDto.followUpId, userId },
    });
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
      // eslint-disable-next-line no-console
      console.log(
        `[MOCK EMAIL SENT] To: Company of Job ${followUp.jobId}, Content: ${followUp.content}`,
      );
    }

    return this.followUpRepository.save(followUp);
  }

  async markAsOpened(trackingToken: string): Promise<void> {
    const followUp = await this.followUpRepository.findOne({
      where: { trackingToken },
    });

    if (followUp && !followUp.openedAt) {
      followUp.openedAt = new Date();
      await this.followUpRepository.save(followUp);
    }
  }
}
