import { IsString, IsEnum, IsOptional, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeniorityLevel, type AvoidPreferences } from '../interfaces/profile-enums';

// ============ CareerIntent DTOs ============

export class SalaryRangeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  min?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  max?: number | null;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency: string;
}

export class AvoidPreferencesDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industries?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}

export class UpdateCareerIntentDto {
  @ApiPropertyOptional({ type: [String], example: ['Frontend Developer', 'React Developer'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applyNowRoles?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Tech Lead', 'Engineering Manager'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetRoles?: string[];

  @ApiPropertyOptional({ enum: SeniorityLevel })
  @IsOptional()
  @IsEnum(SeniorityLevel)
  desiredSeniority?: SeniorityLevel;

  @ApiPropertyOptional({ type: SalaryRangeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryRangeDto)
  salaryExpectation?: SalaryRangeDto;

  @ApiPropertyOptional({ type: [String], example: ['startup', 'corporate'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  companyPreferences?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Technology', 'Finance'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industries?: string[];

  @ApiPropertyOptional({ type: AvoidPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AvoidPreferencesDto)
  avoid?: AvoidPreferences;
}
