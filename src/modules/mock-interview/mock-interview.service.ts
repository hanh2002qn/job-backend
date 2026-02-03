import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockInterview, InterviewStatus, InterviewMessage } from './entities/mock-interview.entity';
import { GeminiService } from '../ai/gemini.service';
import { ProfilesService } from '../profiles/profiles.service';
import { JobsService } from '../jobs/jobs.service';
import { StartInterviewDto } from './dto/mock-interview.dto';

@Injectable()
export class MockInterviewService {
  constructor(
    @InjectRepository(MockInterview)
    private interviewRepository: Repository<MockInterview>,
    @InjectRepository(InterviewMessage)
    private messageRepository: Repository<InterviewMessage>,
    private geminiService: GeminiService,
    private profilesService: ProfilesService,
    private jobsService: JobsService,
  ) {}

  async start(userId: string, dto: StartInterviewDto) {
    const profile = await this.profilesService.findByUserId(userId);
    if (!profile) throw new NotFoundException('Please complete your profile first');

    let jobContext = '';
    if (dto.jobId) {
      const job = await this.jobsService.findOne(dto.jobId);
      if (job) {
        jobContext = `Job Title: ${job.title}\nDescription: ${job.description}\nCompany: ${job.company}`;
      }
    } else if (dto.customJobDescription) {
      jobContext = dto.customJobDescription;
    }

    const interview = this.interviewRepository.create({
      userId,
      jobId: dto.jobId,
      status: InterviewStatus.IN_PROGRESS,
    });

    const savedInterview = await this.interviewRepository.save(interview);

    // Generate first question
    const prompt = `
      You are an expert interviewer. You are conducting a mock interview for a user with the following profile:
      Skills: ${profile.skills?.join(', ')}
      Preferred Industries: ${profile.preferredIndustries?.join(', ')}
      
      Job Context:
      ${jobContext}
      
      Please start the interview by asking a relevant first question (brief, professional).
      Return ONLY the question text.
    `;

    const question = await this.geminiService.generateContent(prompt);

    await this.messageRepository.save({
      interviewId: savedInterview.id,
      role: 'ai',
      content: question,
    });

    return {
      interviewId: savedInterview.id,
      firstQuestion: question,
    };
  }

  async submitAnswer(userId: string, interviewId: string, answer: string) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId, userId },
      relations: ['messages'],
    });

    if (!interview) throw new NotFoundException('Interview session not found');
    if (interview.status === InterviewStatus.COMPLETED) {
      throw new BadRequestException('Interview already completed');
    }

    // Save user message
    await this.messageRepository.save({
      interviewId,
      role: 'user',
      content: answer,
    });

    // Strategy: After 5 exchanges, provide final evaluation
    const exchangeCount = interview.messages.filter((m) => m.role === 'user').length + 1;

    if (exchangeCount >= 5) {
      return this.finishInterview(interview, answer);
    }

    // Generate feedback and next question
    const history = interview.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const prompt = `
      You are an expert interviewer.
      Conversation history:
      ${history}
      
      User's latest answer: "${answer}"
      
      Tasks:
      1. Provide a very brief constructive feedback (1 sentence) for the latest answer.
      2. Ask the next professional follow-up question.
      
      Return as JSON: { "feedback": "...", "nextQuestion": "..." }
    `;

    const response = await this.geminiService.generateJson<{
      feedback: string;
      nextQuestion: string;
    }>(prompt);

    await this.messageRepository.save({
      interviewId,
      role: 'ai',
      content: response.nextQuestion,
      feedback: response.feedback,
    });

    return response;
  }

  private async finishInterview(interview: MockInterview, lastAnswer: string) {
    const history = interview.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const prompt = `
      The interview is finished.
      History:
      ${history}
      USER: ${lastAnswer}
      
      Please provide a comprehensive evaluation:
      1. Strengths observed.
      2. Areas for improvement.
      3. An overall score (0-100).
      
      Return as JSON: { "evaluation": "markdown text...", "score": 85 }
    `;

    const result = await this.geminiService.generateJson<{ evaluation: string; score: number }>(
      prompt,
    );

    interview.status = InterviewStatus.COMPLETED;
    interview.evaluation = result.evaluation;
    interview.overallScore = result.score;
    await this.interviewRepository.save(interview);

    return {
      status: 'completed',
      ...result,
    };
  }

  async getHistory(userId: string) {
    return this.interviewRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getDetail(userId: string, id: string) {
    return this.interviewRepository.findOne({
      where: { id, userId },
      relations: ['messages'],
    });
  }
}
