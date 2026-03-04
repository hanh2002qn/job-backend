import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GroqService } from './groq.service';
import { OpenAIService } from './openai.service';
import { SettingsService } from '../settings/settings.service';
import type { LlmService } from './llm.interface';

type LlmProviderName = 'gemini' | 'groq' | 'openai';

/**
 * LLM Router — dynamically selects the active LLM provider at runtime
 * and provides automatic fallback if the primary provider fails.
 *
 * Provider order for fallback: primary → remaining configured providers.
 */
@Injectable()
export class LlmRouterService implements LlmService {
  private readonly logger = new Logger(LlmRouterService.name);

  private readonly providerMap: Record<LlmProviderName, LlmService>;

  constructor(
    private readonly gemini: GeminiService,
    private readonly groq: GroqService,
    private readonly openai: OpenAIService,
    private readonly settings: SettingsService,
  ) {
    this.providerMap = {
      gemini: this.gemini,
      groq: this.groq,
      openai: this.openai,
    };
  }

  /**
   * Get the ordered list of providers to try.
   * Primary provider first, then the remaining as fallbacks.
   */
  private getProviderChain(): LlmService[] {
    const primary =
      (this.settings.getSettingFromCache<string>('llm_provider') as LlmProviderName) || 'gemini';
    const chain: LlmService[] = [this.providerMap[primary]];

    // Add other providers as fallback
    for (const [name, service] of Object.entries(this.providerMap)) {
      if (name !== primary) {
        chain.push(service);
      }
    }

    return chain;
  }

  async generateContent(
    prompt: string,
    systemInstruction?: string,
    userId?: string,
    feature?: string,
  ): Promise<string> {
    return this.withFallback('generateContent', (provider) =>
      provider.generateContent(prompt, systemInstruction, userId, feature),
    );
  }

  async generateJson<T>(
    prompt: string,
    systemInstruction?: string,
    userId?: string,
    feature?: string,
  ): Promise<T> {
    return this.withFallback('generateJson', (provider) =>
      provider.generateJson<T>(prompt, systemInstruction, userId, feature),
    );
  }

  async *generateStream(prompt: string, systemInstruction?: string): AsyncIterable<string> {
    // Streaming uses primary only — fallback is too complex for streams
    const chain = this.getProviderChain();
    yield* chain[0].generateStream(prompt, systemInstruction);
  }

  async getPromptContent(key: string, defaultContent: string): Promise<string> {
    // Prompt content is provider-agnostic; use primary
    const chain = this.getProviderChain();
    return chain[0].getPromptContent(key, defaultContent);
  }

  /**
   * Try each provider in the chain until one succeeds.
   */
  private async withFallback<T>(
    operation: string,
    fn: (provider: LlmService) => Promise<T>,
  ): Promise<T> {
    const chain = this.getProviderChain();
    let lastError: Error | undefined;

    for (let i = 0; i < chain.length; i++) {
      try {
        return await fn(chain[i]);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (i < chain.length - 1) {
          this.logger.warn(
            `${operation} failed on provider ${i + 1}, falling back to provider ${i + 2}: ${lastError.message}`,
          );
        }
      }
    }

    this.logger.error(`${operation} failed on all providers`);
    throw lastError ?? new Error(`${operation} failed on all providers`);
  }
}
