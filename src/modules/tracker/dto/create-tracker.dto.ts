import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '../entities/job-tracker.entity';

export class CreateTrackerDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    jobId: string;

    @ApiProperty({ enum: ApplicationStatus, default: ApplicationStatus.SAVED })
    @IsOptional()
    @IsEnum(ApplicationStatus)
    status?: ApplicationStatus;
}
