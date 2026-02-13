import { IsString, IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectContext } from '../interfaces/profile-enums';

// ============ Project DTOs ============

export class CreateProjectDto {
  @ApiProperty({ example: 'E-commerce Platform' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: ProjectContext })
  @IsOptional()
  @IsEnum(ProjectContext)
  context?: ProjectContext;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Lead Developer' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ type: [String], description: 'Skill IDs' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  skillsUsed?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  outcomes?: string[];
}

export class UpdateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ProjectContext })
  @IsOptional()
  @IsEnum(ProjectContext)
  context?: ProjectContext;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  skillsUsed?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  outcomes?: string[];
}
