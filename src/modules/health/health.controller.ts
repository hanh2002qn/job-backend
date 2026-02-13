import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Get()
  async check() {
    const result: Record<string, unknown> = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    // Database check
    try {
      await this.dataSource.query('SELECT 1');
      result.database = { status: 'up' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      result.database = { status: 'down', error: message };
      result.status = 'degraded';
    }

    return result;
  }
}
