import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CV } from './entities/cv.entity';
import { GenerateCvDto } from './dto/generate-cv.dto';
import { JobsService } from '../jobs/jobs.service';
import { ProfilesService } from '../profiles/profiles.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(CV)
    private cvRepository: Repository<CV>,
    private jobsService: JobsService,
    private profilesService: ProfilesService,
    private subscriptionService: SubscriptionService,
  ) {}

  async generate(userId: string, generateDto: GenerateCvDto): Promise<CV> {
    // Freemium Check
    const isPremium = await this.subscriptionService.isPremium(userId);
    if (!isPremium) {
      const cvCount = await this.cvRepository.count({ where: { userId } });
      if (cvCount >= 2) {
        throw new ForbiddenException(
          'Free users are limited to 2 CVs. Please upgrade to Premium for unlimited CVs.',
        );
      }
    }

    // Template Check
    if (generateDto.template?.startsWith('premium-') && !isPremium) {
      throw new ForbiddenException(
        'This template is only available for Premium users.',
      );
    }

    const job = await this.jobsService.findOne(generateDto.jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const profile = await this.profilesService.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException(
        'Profile not found. Please complete your profile first.',
      );
    }

    // MOCK AI GENERATION LOGIC
    // 1. Keyword Matching & Scoring
    const jobSkills = job.skills || [];
    const profileSkills = profile.skills || [];
    const matchedSkills = jobSkills.filter((skill) =>
      profileSkills.some((ps) =>
        ps.toLowerCase().includes(skill.toLowerCase()),
      ),
    );

    let score = 0;
    if (jobSkills.length > 0) {
      score = Math.round((matchedSkills.length / jobSkills.length) * 100);
    } else {
      score = 70; // Default if no skills defined
    }

    // 2. Generate Bullet Points (Mocking AI)
    const enhancedExperience = (profile.experience || []).map((exp: any) => ({
      ...exp,
      achievements: [
        `Successfully utilized ${matchedSkills[0] || 'core skills'} to improve performance by 20%.`,
        `Collaborated with cross-functional teams to deliver ${job.title} related projects.`,
        `Optimized workflows ensuring 100% compliance with ${job.company} standards.`,
      ],
    }));

    const mockCvContent = {
      personalInfo: {
        fullName: profile.fullName || 'Candidate',
        email: profile.user?.email || 'mock@user.com',
        phone: profile.phone,
        linkedin: profile.linkedin,
        portfolio: profile.portfolio,
      },
      summary: `Highly motivated professional with expertise in ${matchedSkills.join(', ')}. Eager to contribute to ${job.company} as a ${job.title}.`,
      experience: enhancedExperience,
      education: profile.education,
      skills: profileSkills,
      matchedKeywords: matchedSkills,
    };

    const cv = this.cvRepository.create({
      userId,
      jobId: job.id,
      name: `CV for ${job.title}`,
      content: mockCvContent,
      template: generateDto.template || 'ATS-friendly',
      score: score,
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
