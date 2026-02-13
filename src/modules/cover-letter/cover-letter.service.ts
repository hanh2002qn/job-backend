import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoverLetter } from './entities/cover-letter.entity';
import { GenerateCoverLetterDto } from './dto/generate-cover-letter.dto';
import { JobsService } from '../jobs/jobs.service';
import { ProfilesService } from '../profiles/profiles.service';
import { LLM_SERVICE, type LlmService } from '../ai/llm.interface';
import { UpdateCoverLetterDto } from './dto/update-cover-letter.dto';

@Injectable()
export class CoverLetterService {
  constructor(
    @InjectRepository(CoverLetter)
    private coverLettersRepository: Repository<CoverLetter>,
    private jobsService: JobsService,
    private profilesService: ProfilesService,
    @Inject(LLM_SERVICE) private llmService: LlmService,
  ) {}

  async generate(userId: string, generateDto: GenerateCoverLetterDto): Promise<CoverLetter> {
    const job = await this.jobsService.findOne(generateDto.jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const profile = await this.profilesService.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const tone = generateDto.tone || 'professional';
    const language = generateDto.language || 'en';
    const candidateName = profile.fullName || 'Candidate';

    const prompt = `
      You are an expert professional writer.
      Task: Write a compelling cover letter for a job application.
      
      Candidate:
      Name: ${candidateName}
      Skills: ${profile.skills?.join(', ')}
      Experience: ${JSON.stringify(profile.experience || [])}
      
      Job:
      Title: ${job.title}
      Company: ${job.company}
      Description: ${job.description}
      
      Requirements:
      Tone: ${tone}
      Language: ${language === 'vi' ? 'Vietnamese' : 'English'}
      
      Output only the body of the cover letter (no placeholders like [Your Name]).
      Start with "Dear Hiring Manager," or similar professional greeting appropriate for the language.
      Keep it concise (300-400 words).
    `;

    const content = await this.llmService.generateContent(prompt);

    const coverLetter = this.coverLettersRepository.create({
      userId,
      jobId: job.id,
      content,
      tone,
      language,
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

  async findOne(userId: string, id: string): Promise<CoverLetter> {
    const coverLetter = await this.coverLettersRepository.findOne({
      where: { id, userId },
      relations: ['job'],
    });
    if (!coverLetter) throw new NotFoundException('Cover letter not found');
    return coverLetter;
  }

  async update(userId: string, id: string, updateDto: UpdateCoverLetterDto): Promise<CoverLetter> {
    const coverLetter = await this.findOne(userId, id);

    if (updateDto.content) coverLetter.content = updateDto.content;
    if (updateDto.tone) coverLetter.tone = updateDto.tone;
    if (updateDto.language) coverLetter.language = updateDto.language;

    return this.coverLettersRepository.save(coverLetter);
  }

  async remove(userId: string, id: string): Promise<void> {
    const coverLetter = await this.findOne(userId, id);
    await this.coverLettersRepository.remove(coverLetter);
  }
}
