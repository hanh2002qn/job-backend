import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';

import { PromptRepository } from './prompt.repository';
import { AiUsageRepository } from './ai-usage.repository';
import { CacheService } from '../../common/redis/cache.service';
import { BaseLlmService } from './base-llm.service';

@Injectable()
export class GroqService extends BaseLlmService implements OnModuleInit {
  protected readonly logger = new Logger(GroqService.name);
  protected readonly providerName = 'Groq';

  private client: Groq;
  private modelName: string;

  constructor(
    private configService: ConfigService,
    cacheService: CacheService,
    promptRepository: PromptRepository,
    aiUsageRepository: AiUsageRepository,
  ) {
    super(cacheService, promptRepository, aiUsageRepository);
  }

  onModuleInit() {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY is not defined. AI features will not work.');
      return;
    }
    this.client = new Groq({ apiKey });
    this.modelName = this.configService.get<string>('GROQ_MODEL') || 'llama-3.3-70b-versatile';
    this.logger.log(`GroqService initialized with model: ${this.modelName}`);
  }

  protected isConfigured(): boolean {
    return !!this.client;
  }

  protected getModelName(): string {
    return this.modelName;
  }

  private buildMessages(prompt: string, systemInstruction?: string): ChatCompletionMessageParam[] {
    const messages: ChatCompletionMessageParam[] = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });
    return messages;
  }

  protected async callProvider(prompt: string, systemInstruction?: string) {
    const completion = await this.client.chat.completions.create({
      model: this.modelName,
      messages: this.buildMessages(prompt, systemInstruction),
      temperature: 0.7,
    });
    return {
      text: completion.choices[0]?.message?.content || '',
      inputTokens: completion.usage?.prompt_tokens,
      outputTokens: completion.usage?.completion_tokens,
      totalTokens: completion.usage?.total_tokens,
    };
  }

  protected async callProviderJson(prompt: string, systemInstruction?: string) {
    const completion = await this.client.chat.completions.create({
      model: this.modelName,
      messages: this.buildMessages(
        `${prompt}\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no explanation.`,
        systemInstruction,
      ),
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    return {
      text: completion.choices[0]?.message?.content || '',
      inputTokens: completion.usage?.prompt_tokens,
      outputTokens: completion.usage?.completion_tokens,
      totalTokens: completion.usage?.total_tokens,
    };
  }

  async *generateStream(prompt: string, systemInstruction?: string): AsyncIterable<string> {
    if (!this.isConfigured()) {
      throw new Error('Groq API is not configured.');
    }
    const stream = await this.client.chat.completions.create({
      model: this.modelName,
      messages: this.buildMessages(prompt, systemInstruction),
      temperature: 0.7,
      stream: true,
    });
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
  }
}
