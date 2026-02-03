import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ExtensionEventType {
  JOB_VIEWED = 'job_viewed',
  JOB_APPLIED = 'job_applied',
  APPLICATION_SUBMITTED = 'application_submitted',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  OFFER_RECEIVED = 'offer_received',
  REJECTED = 'rejected',
}

export enum Platform {
  TOPCV = 'topcv',
  LINKEDIN = 'linkedin',
  VIETNAMWORKS = 'vietnamworks',
  ITVIEC = 'itviec',
  OTHER = 'other',
}

export class ExtensionEventDto {
  @ApiProperty({ enum: ExtensionEventType })
  @IsEnum(ExtensionEventType)
  eventType: ExtensionEventType;

  @ApiProperty({ description: 'URL of the job page' })
  @IsUrl()
  jobUrl: string;

  @ApiProperty({ enum: Platform })
  @IsEnum(Platform)
  platform: Platform;

  @ApiProperty({ required: false, description: 'Job title extracted from page' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiProperty({ required: false, description: 'Company name extracted from page' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ required: false, description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class JobStatusResponseDto {
  @ApiProperty({ description: 'Whether job exists in tracker' })
  tracked: boolean;

  @ApiProperty({ required: false, description: 'Current application status' })
  status?: string;

  @ApiProperty({ required: false, description: 'Tracker entry ID' })
  trackerId?: string;

  @ApiProperty({ required: false, description: 'Job ID in our system' })
  jobId?: string;
}
