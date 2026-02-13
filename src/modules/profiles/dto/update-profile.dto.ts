import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SeniorityLevel, WorkMode } from '../interfaces/profile-enums';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Full name', example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+84912345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Address', example: 'Ha Noi, Vietnam' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Current job role', example: 'Senior Frontend Developer' })
  @IsOptional()
  @IsString()
  currentRole?: string;

  @ApiPropertyOptional({ enum: SeniorityLevel, description: 'Seniority level' })
  @IsOptional()
  @IsEnum(SeniorityLevel)
  seniorityLevel?: SeniorityLevel;

  @ApiPropertyOptional({ description: 'Years of experience', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsOfExperience?: number;

  @ApiPropertyOptional({ description: 'Current location', example: 'Ho Chi Minh City' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: WorkMode, description: 'Preferred work mode' })
  @IsOptional()
  @IsEnum(WorkMode)
  workPreference?: WorkMode;

  @ApiPropertyOptional({ description: 'LinkedIn profile URL', example: 'https://linkedin.com/in/johndoe' })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional({ description: 'Portfolio website URL', example: 'https://johndoe.dev' })
  @IsOptional()
  @IsString()
  portfolio?: string;
}
