import { IsString, IsEnum, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SkillCategory,
  SkillLevel,
  type SkillContext,
  type SkillEvidence,
} from '../interfaces/profile-enums';

// ============ Skill DTOs ============

export class SkillContextDto {
  @ApiProperty({ enum: ['experience', 'project', 'education', 'certification'] })
  @IsString()
  type: 'experience' | 'project' | 'education' | 'certification';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceId?: string | null;
}

export class SkillEvidenceDto {
  @ApiProperty({ enum: ['achievement', 'metric', 'interview_answer', 'cv_bullet'] })
  @IsString()
  type: 'achievement' | 'metric' | 'interview_answer' | 'cv_bullet';

  @ApiProperty()
  @IsString()
  description: string;
}

export class CreateSkillDto {
  @ApiProperty({ example: 'React' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: SkillCategory })
  @IsOptional()
  @IsEnum(SkillCategory)
  category?: SkillCategory;

  @ApiPropertyOptional({ enum: SkillLevel })
  @IsOptional()
  @IsEnum(SkillLevel)
  level?: SkillLevel;

  @ApiPropertyOptional({ type: [SkillContextDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillContextDto)
  contexts?: SkillContext[];

  @ApiPropertyOptional({ type: [SkillEvidenceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillEvidenceDto)
  evidence?: SkillEvidence[];

  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @IsNumber()
  lastUsedYear?: number;
}

export class UpdateSkillDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: SkillCategory })
  @IsOptional()
  @IsEnum(SkillCategory)
  category?: SkillCategory;

  @ApiPropertyOptional({ enum: SkillLevel })
  @IsOptional()
  @IsEnum(SkillLevel)
  level?: SkillLevel;

  @ApiPropertyOptional({ type: [SkillContextDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillContextDto)
  contexts?: SkillContext[];

  @ApiPropertyOptional({ type: [SkillEvidenceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillEvidenceDto)
  evidence?: SkillEvidence[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lastUsedYear?: number;
}

export class MergeSkillsDto {
  @ApiProperty({ description: 'IDs of skills to merge' })
  @IsArray()
  @IsString({ each: true })
  skillIds: string[];

  @ApiProperty({ description: 'Name for merged skill' })
  @IsString()
  targetName: string;
}
