import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Check application health status' })
  @ApiResponse({ status: 200, description: 'Application health information returned.' })
  async check(): Promise<Record<string, unknown>> {
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
