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

    const difficulty = dto.difficulty || 'medium';
    const type = dto.type || 'behavioral';

    const interview = this.interviewRepository.create({
      userId,
      jobId: dto.jobId,
      status: InterviewStatus.IN_PROGRESS,
      difficulty,
      type,
    });

    const savedInterview = await this.interviewRepository.save(interview);

    // Generate first question
    const prompt = `
      You are an expert interviewer. You are conducting a mock interview for a user.
      
      User Profile:
      Skills: ${profile.skills?.join(', ')}
      Preferred Industries: ${profile.preferredIndustries?.join(', ')}
      
      Job Context:
      ${jobContext}
      
      Interview Settings:
      Difficulty: ${difficulty.toUpperCase()}
      Type: ${type.toUpperCase()}
      
      Instructions:
      Start the interview by asking a relevant first question matching the difficulty and type.
      For 'technical' interviews, ask a coding or concept question.
      For 'behavioral', ask about soft skills or past experiences.
      For 'system_design', ask about architecture (if applicable).
      
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

  async retry(userId: string, interviewId: string) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId, userId },
      relations: ['job'],
    });

    if (!interview) throw new NotFoundException('Interview session not found');

    // Reset interview state
    interview.status = InterviewStatus.IN_PROGRESS;
    interview.evaluation = null;
    interview.overallScore = null;
    await this.interviewRepository.save(interview);

    // Clear messages
    await this.messageRepository.delete({ interviewId });

    // Regenerate first question based on original settings
    let jobContext = '';
    if (interview.job) {
      jobContext = `Job Title: ${interview.job.title}\nDescription: ${interview.job.description}\nCompany: ${interview.job.company}`;
    }

    const profile = await this.profilesService.findByUserId(userId);
    if (!profile) throw new NotFoundException('Profile not found');

    const prompt = `
      You are an expert interviewer. Restarting a mock interview session.
      
      User Profile:
      Skills: ${profile.skills?.join(', ')}
      
      Job Context:
      ${jobContext}
      
      Interview Settings:
      Difficulty: ${interview.difficulty?.toUpperCase() || 'MEDIUM'}
      Type: ${interview.type?.toUpperCase() || 'BEHAVIORAL'}
      
      Instructions:
      Start the interview by asking a relevant first question matching the difficulty and type.
      Return ONLY the question text.
    `;

    const question = await this.geminiService.generateContent(prompt);

    await this.messageRepository.save({
      interviewId: interview.id,
      role: 'ai',
      content: question,
    });

    return {
      interviewId: interview.id,
      firstQuestion: question,
      message: 'Interview restarted successfully',
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
      Settings: ${interview.difficulty?.toUpperCase()} ${interview.type?.toUpperCase()}
      
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
