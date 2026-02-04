import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartInterviewDto {
  @ApiPropertyOptional({ description: 'Job ID from the system' })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional({ description: 'Custom Job Description if not in system' })
  @IsOptional()
  @IsString()
  customJobDescription?: string;

  @ApiPropertyOptional({ enum: ['easy', 'medium', 'hard'], default: 'medium' })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({
    enum: ['behavioral', 'technical', 'system_design'],
    default: 'behavioral',
  })
  @IsOptional()
  @IsString()
  type?: string;
}

export class SubmitAnswerDto {
  @ApiProperty({ description: 'The user answer to the AI question' })
  @IsString()
  answer: string;
}
