import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateAiFeatureDto {
  @ApiPropertyOptional({ example: 'CV Parsing' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ example: 'Parse CV bằng AI để extract structured data' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ example: 100, description: '0 = unlimited' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxRequestsPerDay?: number;
}

export class ToggleAiFeatureDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isEnabled: boolean;
}
