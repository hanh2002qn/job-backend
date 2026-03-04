import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSystemSettingDto {
  @ApiPropertyOptional()
  @IsOptional()
  // Using unknown instead of any to satisfy strict type safety rules. JSONB can store primitives or objects.
  value?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
