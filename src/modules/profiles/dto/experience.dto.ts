import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmploymentType, WorkScope, type Responsibility } from '../interfaces/profile-enums';

// ============ Experience DTOs ============

export class ResponsibilityDto {
  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  impact?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];
}

export class CreateExperienceDto {
  @ApiProperty({ example: 'Google' })
  @IsString()
  organization: string;

  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  role: string;

  @ApiPropertyOptional({ enum: EmploymentType })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional({ example: '2022-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ type: [ResponsibilityDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponsibilityDto)
  responsibilities?: Responsibility[];

  @ApiPropertyOptional({ enum: WorkScope })
  @IsOptional()
  @IsEnum(WorkScope)
  scope?: WorkScope;

  @ApiPropertyOptional({ type: [String], description: 'Skill IDs' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  skillsUsed?: string[];
}

export class UpdateExperienceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ enum: EmploymentType })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ type: [ResponsibilityDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponsibilityDto)
  responsibilities?: Responsibility[];

  @ApiPropertyOptional({ enum: WorkScope })
  @IsOptional()
  @IsEnum(WorkScope)
  scope?: WorkScope;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  skillsUsed?: string[];
}
