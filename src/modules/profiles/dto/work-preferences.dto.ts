import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WorkMode, WorkingHours } from '../interfaces/profile-enums';

// ============ WorkPreferences DTOs ============

export class UpdateWorkPreferencesDto {
  @ApiPropertyOptional({ type: [String], example: ['San Francisco', 'Remote'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[];

  @ApiPropertyOptional({ enum: WorkMode })
  @IsOptional()
  @IsEnum(WorkMode)
  workMode?: WorkMode;

  @ApiPropertyOptional({ enum: WorkingHours })
  @IsOptional()
  @IsEnum(WorkingHours)
  workingHours?: WorkingHours;

  @ApiPropertyOptional({ type: [String], example: ['English', 'Vietnamese'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ type: [String], example: ['No travel', 'No weekend work'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dealBreakers?: string[];
}
