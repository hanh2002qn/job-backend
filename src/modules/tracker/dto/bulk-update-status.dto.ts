import { IsArray, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '../entities/job-tracker.entity';

export class BulkUpdateStatusDto {
  @ApiProperty({
    description: 'Array of tracker IDs to update',
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  trackerIds: string[];

  @ApiProperty({
    description: 'New status to apply',
    enum: ApplicationStatus,
    example: ApplicationStatus.APPLIED,
  })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}
