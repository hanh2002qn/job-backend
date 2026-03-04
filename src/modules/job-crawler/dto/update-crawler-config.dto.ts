import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsObject } from 'class-validator';

export class UpdateCrawlerConfigDto {
  @ApiPropertyOptional({ description: 'Whether the crawler is currently active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Specific configuration for this crawler as JSON' })
  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;
}
