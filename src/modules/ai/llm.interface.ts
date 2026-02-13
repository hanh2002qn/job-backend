/**
 * Abstract LLM Service interface
 * All LLM providers (Gemini, Groq, etc.) must implement this interface
 */
export interface LlmService {
  /**
   * Generate text content from a prompt
   */
  generateContent(
    prompt: string,
    systemInstruction?: string,
    userId?: string,
    feature?: string,
  ): Promise<string>;

  /**
   * Generate and parse JSON from a prompt
   */
  generateJson<T>(
    prompt: string,
    systemInstruction?: string,
    userId?: string,
    feature?: string,
  ): Promise<T>;

  /**
   * Stream text content from a prompt
   */
  generateStream(prompt: string, systemInstruction?: string): AsyncIterable<string>;

  /**
   * Get prompt content from database or use default
   */
  getPromptContent(key: string, defaultContent: string): Promise<string>;
}

/**
 * Injection token for LLM service
 * Usage: @Inject(LLM_SERVICE) private llmService: LlmService
 */
export const LLM_SERVICE = Symbol('LLM_SERVICE');
