import { IsEnum, IsNotEmpty, IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '../entities/job-tracker.entity';

export class CreateTrackerDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    jobId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    manualTitle?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    manualCompany?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    manualUrl?: string;

    @ApiProperty({ enum: ApplicationStatus, default: ApplicationStatus.SAVED })
    @IsOptional()
    @IsEnum(ApplicationStatus)
    status?: ApplicationStatus;
}
