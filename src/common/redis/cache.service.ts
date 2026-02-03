import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CACHE_TTL } from './queue.constants';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.warn(`Cache get error for key ${key}: ${error}`);
      return undefined;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.warn(`Cache set error for key ${key}: ${error}`);
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.warn(`Cache del error for key ${key}: ${error}`);
    }
  }

  /**
   * Wrap a function with cache
   * If cache exists, return cached value
   * Otherwise, execute function and cache result
   */
  async wrap<T>(key: string, fn: () => Promise<T>, ttl: number = CACHE_TTL.JOB_DETAIL): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      this.logger.debug(`Cache HIT: ${key}`);
      return cached;
    }

    this.logger.debug(`Cache MISS: ${key}`);
    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }

  /**
   * Delete multiple keys by pattern
   */
  async delByPattern(pattern: string): Promise<void> {
    try {
      this.logger.debug(`Invalidating pattern: ${pattern}`);

      // Safety check for store and keys method using unknown cast to stay a bit safer with types
      const store = (
        this.cacheManager as unknown as { store?: { keys?: (p: string) => Promise<string[]> } }
      ).store;

      if (store && typeof store.keys === 'function') {
        const keys = await store.keys(pattern);
        if (Array.isArray(keys)) {
          for (const key of keys) {
            await this.cacheManager.del(key);
          }
        }
      }
    } catch (error) {
      this.logger.warn(`Cache delByPattern error for ${pattern}: ${error}`);
    }
  }

  /**
   * Build cache key from parts
   */
  buildKey(...parts: (string | number)[]): string {
    return parts.join(':');
  }
}
