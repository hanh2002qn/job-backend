import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateRoadmapDto {
  @ApiProperty({ description: 'Target job title or career goal (e.g., Senior Frontend Developer)' })
  @IsNotEmpty()
  @IsString()
  targetGoal: string;

  @ApiProperty({ description: 'Optional Job ID to base the roadmap on', required: false })
  @IsOptional()
  @IsUUID()
  jobId?: string;
}
