import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly proxies: string[];
  private currentIndex = 0;

  constructor(private readonly configService: ConfigService) {
    const proxyString = this.configService.get<string>('CRAWLER_PROXIES') || '';
    this.proxies = proxyString
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (this.proxies.length > 0) {
      this.logger.log(`Initialized with ${this.proxies.length} proxies.`);
    } else {
      this.logger.warn('No proxies configured. Crawlers will use direct connection.');
    }
  }

  /**
   * Get next proxy in round-robin fashion
   */
  getProxyConfig() {
    if (this.proxies.length === 0) {
      return undefined;
    }

    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;

    // Playwright proxy format: { server: 'http://myproxy.com:3128', username: '...', password: '...' }
    // Assuming input format: http://user:pass@host:port or http://host:port
    try {
      const url = new URL(proxy);
      return {
        server: `${url.protocol}//${url.host}`,
        username: url.username || undefined,
        password: url.password || undefined,
      };
    } catch (error) {
      this.logger.error(`Invalid proxy format: ${proxy}`, error);
      return undefined;
    }
  }

  get hasProxies(): boolean {
    return this.proxies.length > 0;
  }
}
