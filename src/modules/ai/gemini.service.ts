import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

import { PromptRepository } from './prompt.repository';
import { AiUsageRepository } from './ai-usage.repository';
import { CacheService } from '../../common/redis/cache.service';
import { BaseLlmService } from './base-llm.service';

@Injectable()
export class GeminiService extends BaseLlmService implements OnModuleInit {
  protected readonly logger = new Logger(GeminiService.name);
  protected readonly providerName = 'Gemini';

  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private modelName = 'gemini-flash-latest';

  constructor(
    private configService: ConfigService,
    cacheService: CacheService,
    promptRepository: PromptRepository,
    aiUsageRepository: AiUsageRepository,
  ) {
    super(cacheService, promptRepository, aiUsageRepository);
  }

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not defined. AI features will not work.');
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: this.modelName });
  }

  protected isConfigured(): boolean {
    return !!this.genAI;
  }

  protected getModelName(): string {
    return this.modelName;
  }

  protected async callProvider(prompt: string, systemInstruction?: string) {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction,
    });
    const result = await model.generateContent(prompt);
    const usage = result.response.usageMetadata;
    return {
      text: result.response.text(),
      inputTokens: usage?.promptTokenCount,
      outputTokens: usage?.candidatesTokenCount,
      totalTokens: usage?.totalTokenCount,
    };
  }

  protected async callProviderJson(prompt: string, systemInstruction?: string) {
    return this.callProvider(`${prompt}\n\nIMPORTANT: Return ONLY valid JSON.`, systemInstruction);
  }

  async *generateStream(prompt: string, systemInstruction?: string): AsyncIterable<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API is not configured.');
    }
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction,
    });
    const result = await model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  }
}
