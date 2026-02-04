import { IsBoolean, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AlertFrequency, AlertChannel } from '../entities/job-alert.entity';

export class UpdateJobAlertDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ enum: AlertFrequency })
  @IsEnum(AlertFrequency)
  @IsOptional()
  frequency?: AlertFrequency;

  @ApiProperty({ enum: AlertChannel, isArray: true })
  @IsArray()
  @IsEnum(AlertChannel, { each: true })
  @IsOptional()
  channels?: AlertChannel[];
}
