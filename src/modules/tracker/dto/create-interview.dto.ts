import { IsNotEmpty, IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InterviewType } from '../entities/interview-schedule.entity';

export class CreateInterviewDto {
  @ApiProperty({ description: 'Name of the interview round' })
  @IsNotEmpty()
  @IsString()
  roundName: string;

  @ApiProperty({ description: 'Scheduled date and time' })
  @IsNotEmpty()
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ enum: InterviewType, default: InterviewType.OTHER })
  @IsEnum(InterviewType)
  type: InterviewType;

  @ApiProperty({ description: 'Meeting link or office address', required: false })
  @IsOptional()
  @IsString()
  locationUrl?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
