import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prompt } from './entities/prompt.entity';
import { AiUsage } from './entities/ai-usage.entity';
import type { LlmService } from './llm.interface';

@Injectable()
export class OpenAIService implements LlmService, OnModuleInit {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI;
  private defaultModel: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Prompt)
    private promptRepository: Repository<Prompt>,
    @InjectRepository(AiUsage)
    private aiUsageRepository: Repository<AiUsage>,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY is not defined in environment variables. OpenAI features will not work.',
      );
      return;
    }

    const baseURL = this.configService.get<string>('OPENAI_BASE_URL');
    this.defaultModel = this.configService.get<string>('OPENAI_MODEL_NAME') || 'gpt-4o-mini';

    this.openai = new OpenAI({
      apiKey,
      baseURL, // Can be undefined, then it will use default OpenAI endpoint
    });
  }

  async generateContent(
    prompt: string,
    systemInstruction?: string,
    userId?: string,
    feature: string = 'unknown',
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API is not configured.');
    }
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await this.openai.chat.completions.create({
        model: this.defaultModel,
        messages,
      });

      const message = response.choices[0]?.message;
      const text = message?.content || '';

      // Log Usage
      if (userId && response.usage) {
        await this.aiUsageRepository.save({
          userId,
          feature,
          model: this.defaultModel,
          inputTokens: response.usage.prompt_tokens,
          outputTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        });
      }

      return text;
    } catch (error) {
      this.logger.error('Error generating content from OpenAI', error);
      throw error;
    }
  }

  async getPromptContent(key: string, defaultContent: string): Promise<string> {
    try {
      const prompt = await this.promptRepository.findOne({ where: { key, isActive: true } });
      return prompt ? prompt.content : defaultContent;
    } catch (_error) {
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
    if (!this.openai) {
      throw new Error('OpenAI API is not configured.');
    }
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await this.openai.chat.completions.create({
        model: this.defaultModel,
        messages,
        response_format: { type: 'json_object' },
      });

      const messageContent = response.choices[0]?.message?.content || '';
      const text = messageContent.trim();

      // Log Usage
      if (userId && response.usage) {
        await this.aiUsageRepository.save({
          userId,
          feature,
          model: this.defaultModel,
          inputTokens: response.usage.prompt_tokens,
          outputTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        });
      }

      return JSON.parse(text) as T;
    } catch (error) {
      this.logger.error('Failed to parse OpenAI response as JSON', error);
      throw new Error('Invalid AI response format');
    }
  }

  async *generateStream(prompt: string, systemInstruction?: string): AsyncIterable<string> {
    if (!this.openai) {
      throw new Error('OpenAI API is not configured.');
    }
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }
      messages.push({ role: 'user', content: prompt });

      const stream = await this.openai.chat.completions.create({
        model: this.defaultModel,
        messages,
        stream: true,
      });

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) yield text;
      }
    } catch (error) {
      this.logger.error('Error generating streaming content from OpenAI', error);
      throw error;
    }
  }
}
