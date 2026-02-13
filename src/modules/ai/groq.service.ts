import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prompt } from './entities/prompt.entity';
import { AiUsage } from './entities/ai-usage.entity';
import type { LlmService } from './llm.interface';

@Injectable()
export class GroqService implements LlmService, OnModuleInit {
  private readonly logger = new Logger(GroqService.name);
  private client: Groq;
  private model: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Prompt)
    private promptRepository: Repository<Prompt>,
    @InjectRepository(AiUsage)
    private aiUsageRepository: Repository<AiUsage>,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'GROQ_API_KEY is not defined in environment variables. AI features will not work.',
      );
      return;
    }
    this.client = new Groq({ apiKey });
    this.model = this.configService.get<string>('GROQ_MODEL') || 'llama-3.3-70b-versatile';
    this.logger.log(`GroqService initialized with model: ${this.model}`);
  }

  async generateContent(
    prompt: string,
    systemInstruction?: string,
    userId?: string,
    feature: string = 'unknown',
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Groq API is not configured.');
    }

    try {
      const messages: ChatCompletionMessageParam[] = [];

      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }

      messages.push({ role: 'user', content: prompt });

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
      });

      const text = completion.choices[0]?.message?.content || '';

      // Log usage
      if (userId && completion.usage) {
        await this.aiUsageRepository.save({
          userId,
          feature,
          model: this.model,
          inputTokens: completion.usage.prompt_tokens,
          outputTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        });
      }

      return text;
    } catch (error) {
      this.logger.error('Error generating content from Groq', error);
      throw error;
    }
  }

  async getPromptContent(key: string, defaultContent: string): Promise<string> {
    try {
      const prompt = await this.promptRepository.findOne({ where: { key, isActive: true } });
      return prompt ? prompt.content : defaultContent;
    } catch {
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
    if (!this.client) {
      throw new Error('Groq API is not configured.');
    }

    try {
      const messages: ChatCompletionMessageParam[] = [];

      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }

      messages.push({
        role: 'user',
        content: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no explanation.`,
      });

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const text = completion.choices[0]?.message?.content || '';

      // Log usage
      if (userId && completion.usage) {
        await this.aiUsageRepository.save({
          userId,
          feature,
          model: this.model,
          inputTokens: completion.usage.prompt_tokens,
          outputTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        });
      }

      // Parse JSON
      let cleaned = text.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
      }

      return JSON.parse(cleaned) as T;
    } catch (error) {
      this.logger.error('Failed to generate/parse JSON from Groq', error);
      throw new Error('Invalid AI response format');
    }
  }

  async *generateStream(prompt: string, systemInstruction?: string): AsyncIterable<string> {
    if (!this.client) {
      throw new Error('Groq API is not configured.');
    }

    try {
      const messages: ChatCompletionMessageParam[] = [];

      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }

      messages.push({ role: 'user', content: prompt });

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        stream: true,
      });

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) yield text;
      }
    } catch (error) {
      this.logger.error('Error generating streaming content from Groq', error);
      throw error;
    }
  }
}
