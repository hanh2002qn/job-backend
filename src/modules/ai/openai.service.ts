import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Prompt } from './entities/prompt.entity';
import { AiUsage } from './entities/ai-usage.entity';
import { CacheService } from '../../common/redis/cache.service';
import { BaseLlmService } from './base-llm.service';

@Injectable()
export class OpenAIService extends BaseLlmService implements OnModuleInit {
  protected readonly logger = new Logger(OpenAIService.name);
  protected readonly providerName = 'OpenAI';

  private openai: OpenAI;
  private defaultModel: string;

  constructor(
    private configService: ConfigService,
    cacheService: CacheService,
    @InjectRepository(Prompt) promptRepository: Repository<Prompt>,
    @InjectRepository(AiUsage) aiUsageRepository: Repository<AiUsage>,
  ) {
    super(cacheService, promptRepository, aiUsageRepository);
  }

  onModuleInit() {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY is not defined. OpenAI features will not work.');
      return;
    }
    const baseURL = this.configService.get<string>('OPENAI_BASE_URL');
    this.defaultModel = this.configService.get<string>('OPENAI_MODEL_NAME') || 'gpt-4o-mini';
    this.openai = new OpenAI({ apiKey, baseURL });
  }

  protected isConfigured(): boolean {
    return !!this.openai;
  }

  protected getModelName(): string {
    return this.defaultModel;
  }

  private buildMessages(
    prompt: string,
    systemInstruction?: string,
  ): OpenAI.Chat.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });
    return messages;
  }

  protected async callProvider(prompt: string, systemInstruction?: string) {
    const response = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: this.buildMessages(prompt, systemInstruction),
    });
    return {
      text: response.choices[0]?.message?.content || '',
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      totalTokens: response.usage?.total_tokens,
    };
  }

  protected async callProviderJson(prompt: string, systemInstruction?: string) {
    const response = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: this.buildMessages(prompt, systemInstruction),
      response_format: { type: 'json_object' },
    });
    return {
      text: response.choices[0]?.message?.content || '',
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      totalTokens: response.usage?.total_tokens,
    };
  }

  async *generateStream(prompt: string, systemInstruction?: string): AsyncIterable<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API is not configured.');
    }
    const stream = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: this.buildMessages(prompt, systemInstruction),
      stream: true,
    });
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
  }
}
