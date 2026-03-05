import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PlanLimitsDto {
  @ApiProperty({ example: 3, description: '9999 = unlimited' })
  @IsInt()
  @Min(0)
  max_cvs: number;

  @ApiProperty({ example: 100, description: '0 = no credits (free plan)' })
  @IsInt()
  @Min(0)
  monthly_credits: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  ai_access: boolean;

  @ApiProperty({ example: ['basic', 'modern'] })
  @IsString({ each: true })
  cv_templates: string[];
}

export class CreatePlanDto {
  @ApiProperty({ example: 'premium_monthly' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Premium Monthly' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Full access to all features' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 9.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'month', enum: ['month', 'year'] })
  @IsOptional()
  @IsIn(['month', 'year'])
  interval?: 'month' | 'year';

  @ApiProperty({ type: PlanLimitsDto })
  @ValidateNested()
  @Type(() => PlanLimitsDto)
  limits: PlanLimitsDto;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePlanDto {
  @ApiPropertyOptional({ example: 'Premium Monthly' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'Full access to all features' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 9.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'month', enum: ['month', 'year'] })
  @IsOptional()
  @IsIn(['month', 'year'])
  interval?: 'month' | 'year';

  @ApiPropertyOptional({ type: PlanLimitsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PlanLimitsDto)
  limits?: PlanLimitsDto;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
