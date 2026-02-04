import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CV } from './entities/cv.entity';
import { CvVersion } from './entities/cv-version.entity';
import { GenerateCvDto } from './dto/generate-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { JobsService } from '../jobs/jobs.service';
import { ProfilesService } from '../profiles/profiles.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { GeminiService } from '../ai/gemini.service';
import { PdfService } from './services/pdf.service';
import { CvRendererService } from './services/cv-renderer.service';
import type { CvContent } from './interfaces/cv.interface';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(CV)
    private cvRepository: Repository<CV>,
    @InjectRepository(CvVersion)
    private cvVersionRepository: Repository<CvVersion>,
    private jobsService: JobsService,
    private profilesService: ProfilesService,
    private subscriptionService: SubscriptionService,
    private geminiService: GeminiService,
    private pdfService: PdfService,
    private cvRendererService: CvRendererService,
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
      throw new ForbiddenException('This template is only available for Premium users.');
    }

    const job = await this.jobsService.findOne(generateDto.jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const profile = await this.profilesService.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found. Please complete your profile first.');
    }

    const jobSkills = job.skills || [];
    const profileSkills = profile.skills || [];
    const matchedSkills = jobSkills.filter((skill) =>
      profileSkills.some((ps) => ps.toLowerCase().includes(skill.toLowerCase())),
    );

    // AI Generation for high-quality content
    const prompt = `
      You are an expert career coach and CV writer.
      Task: Create high-impact CV content tailored for the following job.
      
      USER PROFILE:
      Skills: ${profile.skills?.join(', ')}
      Education: ${JSON.stringify(profile.education)}
      Experience: ${JSON.stringify(profile.experience)}
      
      TARGET JOB:
      Title: ${job.title}
      Company: ${job.company}
      Description: ${job.description}
      
      Generate a professional "summary" and optimized "experience" bullet points (achievements) for each role in the user's experience.
      Return the response as JSON only with this structure:
      {
        "summary": "...",
        "experience": [
          {
            "company": "...",
            "achievements": ["...", "..."]
          }
        ],
        "score": 85
      }
    `;

    const aiResult = await this.geminiService.generateJson<{
      summary: string;
      experience: { company: string; achievements: string[] }[];
      score: number;
    }>(prompt);

    // Merge AI content with profile structure
    const content: CvContent = {
      personalInfo: {
        fullName: profile.fullName,
        email: profile.user?.email || '',
        phone: profile.phone,
        linkedin: profile.linkedin,
        portfolio: profile.portfolio,
      },
      summary: aiResult.summary,
      experience: (profile.experience || []).map((exp) => {
        const aiExp = (aiResult.experience || []).find((ae) => ae.company === exp.company);
        return {
          ...exp,
          achievements: aiExp ? aiExp.achievements : [],
        };
      }),
      education: profile.education,
      skills: profileSkills,
      matchedKeywords: matchedSkills,
    };

    const cv = this.cvRepository.create({
      userId,
      jobId: job.id,
      name: `CV for ${job.title}`,
      content,
      template: generateDto.template || 'ATS-friendly',
      score: aiResult.score,
    });

    return this.cvRepository.save(cv);
  }

  async tailor(userId: string, cvId: string, jobId: string) {
    const existingCv = await this.cvRepository.findOne({ where: { id: cvId, userId } });
    if (!existingCv) throw new NotFoundException('CV not found');

    const job = await this.jobsService.findOne(jobId);
    if (!job) throw new NotFoundException('Target job not found');

    const generateDto: GenerateCvDto = {
      jobId,
      template: existingCv.template,
    };

    return this.generate(userId, generateDto);
  }

  async findAll(userId: string): Promise<CV[]> {
    return this.cvRepository.find({
      where: { userId },
      relations: ['job'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<CV> {
    const cv = await this.cvRepository.findOne({
      where: { id, userId },
      relations: ['job'],
    });
    if (!cv) throw new NotFoundException('CV not found');
    return cv;
  }
  async update(userId: string, id: string, updateDto: UpdateCvDto) {
    const cv = await this.cvRepository.findOne({
      where: { id, userId },
    });
    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    // Create a version snapshot before updating
    const versionCount = await this.cvVersionRepository.count({ where: { cvId: id } });
    const version = this.cvVersionRepository.create({
      cvId: id,
      versionNumber: versionCount + 1,
      content: cv.content,
    });
    await this.cvVersionRepository.save(version);

    // Update CV fields
    if (updateDto.name) cv.name = updateDto.name;
    if (updateDto.template) cv.template = updateDto.template;
    if (updateDto.content) {
      cv.content = {
        ...cv.content,
        ...updateDto.content,
      };
    }

    return this.cvRepository.save(cv);
  }

  async remove(userId: string, id: string) {
    const cv = await this.cvRepository.findOne({
      where: { id, userId },
    });
    if (!cv) {
      throw new NotFoundException('CV not found');
    }
    return this.cvRepository.remove(cv);
  }

  async getVersions(userId: string, cvId: string) {
    const cv = await this.cvRepository.findOne({ where: { id: cvId, userId } });
    if (!cv) throw new NotFoundException('CV not found');

    return this.cvVersionRepository.find({
      where: { cvId },
      order: { versionNumber: 'DESC' },
    });
  }

  async restoreVersion(userId: string, cvId: string, versionId: string) {
    const cv = await this.cvRepository.findOne({ where: { id: cvId, userId } });
    if (!cv) throw new NotFoundException('CV not found');

    const version = await this.cvVersionRepository.findOne({ where: { id: versionId, cvId } });
    if (!version) throw new NotFoundException('Version not found');

    // Create a backup of current state before restore
    const currentVersionCount = await this.cvVersionRepository.count({ where: { cvId } });
    const backupVersion = this.cvVersionRepository.create({
      cvId,
      versionNumber: currentVersionCount + 1,
      content: cv.content,
    });
    await this.cvVersionRepository.save(backupVersion);

    // Restore content
    cv.content = version.content;
    return this.cvRepository.save(cv);
  }

  async downloadPdf(userId: string, cvId: string): Promise<Buffer> {
    const cv = await this.cvRepository.findOne({ where: { id: cvId, userId } });
    if (!cv) throw new NotFoundException('CV not found');

    // Render HTML
    const html = this.cvRendererService.render(cv.content, cv.template || 'modern');

    // Generate PDF
    return this.pdfService.generatePdf(html);
  }
}
