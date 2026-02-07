import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prompt } from './entities/prompt.entity';
import { AiUsage } from './entities/ai-usage.entity';

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Prompt)
    private promptRepository: Repository<Prompt>,
    @InjectRepository(AiUsage)
    private aiUsageRepository: Repository<AiUsage>,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY is not defined in environment variables. AI features will not work.',
      );
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
    });
  }

  async generateContent(
    prompt: string,
    systemInstruction?: string,
    userId?: string,
    feature: string = 'unknown',
  ): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini API is not configured.');
    }
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-flash-latest',
        systemInstruction,
      });
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Log Usage
      if (userId) {
        const usage = result.response.usageMetadata;
        if (usage) {
          await this.aiUsageRepository.save({
            userId,
            feature,
            model: 'gemini-flash-latest',
            inputTokens: usage.promptTokenCount,
            outputTokens: usage.candidatesTokenCount,
            totalTokens: usage.totalTokenCount,
          });
        }
      }

      return text;
    } catch (error) {
      this.logger.error('Error generating content from Gemini', error);
      throw error;
    }
  }

  async getPromptContent(key: string, defaultContent: string): Promise<string> {
    try {
      const prompt = await this.promptRepository.findOne({ where: { key, isActive: true } });
      return prompt ? prompt.content : defaultContent;
    } catch (error) {
      this.logger.warn(`Failed to fetch prompt ${key}, using default.`);
      return defaultContent;
    }
  }

  async generateJson<T>(
    prompt: string,
    systemInstruction?: string,
    userId?: string,
    feature: string = 'unknown',
  ): Promise<T> {
    const result = await this.generateContent(
      `${prompt}\n\nIMPORTANT: Return ONLY valid JSON.`,
      systemInstruction,
      userId,
      feature,
    );
    try {
      // Clean up markdown code blocks if present
      let cleaned = result.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
      }
      return JSON.parse(cleaned) as T;
    } catch (_error) {
      this.logger.error('Failed to parse Gemini response as JSON', result);
      throw new Error('Invalid AI response format');
    }
  }

  async *generateStream(prompt: string, systemInstruction?: string): AsyncIterable<string> {
    if (!this.genAI) {
      throw new Error('Gemini API is not configured.');
    }
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-flash-latest',
        systemInstruction,
      });
      const result = await model.generateContentStream(prompt);
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
      }
    } catch (_error) {
      this.logger.error('Error generating streaming content from Gemini', _error);
      throw _error;
    }
  }
}
