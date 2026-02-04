import { Injectable, Logger } from '@nestjs/common';

export interface RateLimitConfig {
  source: string;
  requestsPerMinute: number;
  minDelayMs: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
}

interface SourceState {
  lastRequestTime: number;
  currentDelay: number;
  requestCount: number;
  windowStart: number;
  consecutiveErrors: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  topcv: {
    source: 'topcv',
    requestsPerMinute: 30,
    minDelayMs: 2000,
    backoffMultiplier: 2,
    maxBackoffMs: 60000,
  },
  linkedin: {
    source: 'linkedin',
    requestsPerMinute: 10,
    minDelayMs: 5000,
    backoffMultiplier: 3,
    maxBackoffMs: 120000,
  },
  default: {
    source: 'default',
    requestsPerMinute: 20,
    minDelayMs: 3000,
    backoffMultiplier: 2,
    maxBackoffMs: 60000,
  },
};

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly sourceStates: Map<string, SourceState> = new Map();
  private readonly configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Initialize default configs
    Object.entries(DEFAULT_CONFIGS).forEach(([key, config]) => {
      this.configs.set(key, config);
    });
  }

  /**
   * Get or create source state
   */
  private getSourceState(source: string): SourceState {
    if (!this.sourceStates.has(source)) {
      this.sourceStates.set(source, {
        lastRequestTime: 0,
        currentDelay: this.getConfig(source).minDelayMs,
        requestCount: 0,
        windowStart: Date.now(),
        consecutiveErrors: 0,
      });
    }
    return this.sourceStates.get(source)!;
  }

  /**
   * Get config for source
   */
  private getConfig(source: string): RateLimitConfig {
    return this.configs.get(source) || this.configs.get('default')!;
  }

  /**
   * Wait if necessary to respect rate limits
   */
  async throttle(source: string): Promise<void> {
    const state = this.getSourceState(source);
    const config = this.getConfig(source);
    const now = Date.now();

    // Reset window if minute has passed
    if (now - state.windowStart > 60000) {
      state.windowStart = now;
      state.requestCount = 0;
    }

    // Check if we've exceeded requests per minute
    if (state.requestCount >= config.requestsPerMinute) {
      const waitTime = 60000 - (now - state.windowStart);
      if (waitTime > 0) {
        this.logger.warn(`Rate limit reached for ${source}, waiting ${waitTime}ms`);
        await this.sleep(waitTime);
        state.windowStart = Date.now();
        state.requestCount = 0;
      }
    }

    // Ensure minimum delay between requests
    const timeSinceLastRequest = now - state.lastRequestTime;
    if (timeSinceLastRequest < state.currentDelay) {
      const waitTime = state.currentDelay - timeSinceLastRequest;
      await this.sleep(waitTime);
    }

    state.lastRequestTime = Date.now();
    state.requestCount++;
  }

  /**
   * Record successful request - reduce backoff
   */
  recordSuccess(source: string): void {
    const state = this.getSourceState(source);
    const config = this.getConfig(source);

    state.consecutiveErrors = 0;
    // Gradually reduce delay back to minimum
    state.currentDelay = Math.max(config.minDelayMs, state.currentDelay * 0.8);
  }

  /**
   * Record error - increase backoff
   */
  recordError(source: string): void {
    const state = this.getSourceState(source);
    const config = this.getConfig(source);

    state.consecutiveErrors++;
    state.currentDelay = Math.min(
      config.maxBackoffMs,
      state.currentDelay * config.backoffMultiplier,
    );

    this.logger.warn(
      `Error recorded for ${source}. Consecutive: ${state.consecutiveErrors}. New delay: ${state.currentDelay}ms`,
    );
  }

  /**
   * Get current status for monitoring
   */
  getStatus(source: string): {
    currentDelay: number;
    consecutiveErrors: number;
    requestsInWindow: number;
  } {
    const state = this.getSourceState(source);
    return {
      currentDelay: state.currentDelay,
      consecutiveErrors: state.consecutiveErrors,
      requestsInWindow: state.requestCount,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
