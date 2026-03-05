import { Logger } from '@nestjs/common';
import { createHash } from 'crypto';

import { PromptRepository } from './prompt.repository';
import { AiUsageRepository } from './ai-usage.repository';
import { CacheService } from '../../common/redis/cache.service';
import { CACHE_KEYS, CACHE_TTL } from '../../common/redis/queue.constants';
import type { LlmService } from './llm.interface';

/**
 * Model pricing per 1M tokens (USD)
 * Update these when providers change pricing
 */
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // Gemini
  'gemini-flash-latest': { input: 0.075, output: 0.3 },
  'gemini-2.0-flash': { input: 0.075, output: 0.3 },
  'gemini-1.5-pro': { input: 1.25, output: 5.0 },
  // Groq (free tier / very cheap)
  'llama-3.3-70b-versatile': { input: 0.59, output: 0.79 },
  'llama-3.1-8b-instant': { input: 0.05, output: 0.08 },
  // OpenAI
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4o': { input: 2.5, output: 10.0 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
};

/**
 * Abstract base class for all LLM services.
 * Handles common concerns: caching, prompt management, usage logging, cost calculation.
 */
export abstract class BaseLlmService implements LlmService {
  protected abstract readonly logger: Logger;
  protected abstract readonly providerName: string;

  constructor(
    protected readonly cacheService: CacheService,
    protected readonly promptRepository: PromptRepository,
    protected readonly aiUsageRepository: AiUsageRepository,
  ) {}

  // ============ Abstract methods — each provider MUST implement ============

  /**
   * Call the provider-specific API to generate text content.
   * This is the ONLY method each provider needs to implement differently.
   */
  protected abstract callProvider(
    prompt: string,
    systemInstruction?: string,
  ): Promise<{ text: string; inputTokens?: number; outputTokens?: number; totalTokens?: number }>;

  /**
   * Call the provider-specific API to generate JSON content.
   * Providers can use native JSON mode if available.
   */
  protected abstract callProviderJson(
    prompt: string,
    systemInstruction?: string,
  ): Promise<{ text: string; inputTokens?: number; outputTokens?: number; totalTokens?: number }>;

  /**
   * Call the provider-specific streaming API.
   */
  abstract generateStream(prompt: string, systemInstruction?: string): AsyncIterable<string>;

  /**
   * Get the model name being used by this provider.
   */
  protected abstract getModelName(): string;

  /**
   * Check if the provider is properly configured (API key set).
   */
  protected abstract isConfigured(): boolean;

  // ============ Shared implementations ============

  protected generateCacheKey(prompt: string, systemInstruction?: string): string {
    const hash = createHash('md5')
      .update(prompt + (systemInstruction || ''))
      .digest('hex');
    return this.cacheService.buildKey(CACHE_KEYS.AI_RESPONSE, hash);
  }

  async generateContent(
    prompt: string,
    systemInstruction?: string,
    userId?: string,
    feature: string = 'unknown',
  ): Promise<string> {
    const cacheKey = this.generateCacheKey(prompt, systemInstruction);

    return this.cacheService.wrap(
      cacheKey,
      async () => {
        if (!this.isConfigured()) {
          throw new Error(`${this.providerName} API is not configured.`);
        }
        try {
          const result = await this.callProvider(prompt, systemInstruction);

          if (userId) {
            await this.logUsage(userId, feature, result);
          }

          return result.text;
        } catch (error) {
          this.logger.error(`Error generating content from ${this.providerName}`, error);
          throw error;
        }
      },
      CACHE_TTL.AI_RESPONSE,
    );
  }

  async generateJson<T>(
    prompt: string,
    systemInstruction?: string,
    userId?: string,
    feature: string = 'unknown',
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(prompt + ':json', systemInstruction);

    return this.cacheService.wrap(
      cacheKey,
      async () => {
        if (!this.isConfigured()) {
          throw new Error(`${this.providerName} API is not configured.`);
        }
        try {
          const result = await this.callProviderJson(prompt, systemInstruction);

          if (userId) {
            await this.logUsage(userId, feature, result);
          }

          return this.parseJson<T>(result.text);
        } catch (error) {
          this.logger.error(`Failed to generate/parse JSON from ${this.providerName}`, error);
          throw new Error('Invalid AI response format');
        }
      },
      CACHE_TTL.AI_RESPONSE,
    );
  }

  async getPromptContent(key: string, defaultContent: string): Promise<string> {
    const cacheKey = this.cacheService.buildKey(CACHE_KEYS.AI_PROMPT, key);
    return this.cacheService.wrap(
      cacheKey,
      async () => {
        try {
          const prompt = await this.promptRepository.findOne({ where: { key, isActive: true } });
          return prompt ? prompt.content : defaultContent;
        } catch {
          this.logger.warn(`Failed to fetch prompt ${key}, using default.`);
          return defaultContent;
        }
      },
      CACHE_TTL.AI_PROMPT,
    );
  }

  // ============ Helpers ============

  protected parseJson<T>(text: string): T {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
    }
    return JSON.parse(cleaned) as T;
  }

  protected calculateCost(modelName: string, inputTokens: number, outputTokens: number): number {
    const pricing = MODEL_PRICING[modelName];
    if (!pricing) return 0;
    return (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000;
  }

  private async logUsage(
    userId: string,
    feature: string,
    result: { inputTokens?: number; outputTokens?: number; totalTokens?: number },
  ): Promise<void> {
    const modelName = this.getModelName();
    const inputTokens = result.inputTokens ?? 0;
    const outputTokens = result.outputTokens ?? 0;
    const totalTokens = result.totalTokens ?? 0;
    const cost = this.calculateCost(modelName, inputTokens, outputTokens);

    await this.aiUsageRepository.save({
      userId,
      feature,
      model: modelName,
      inputTokens,
      outputTokens,
      totalTokens,
      cost,
    });
  }
}
