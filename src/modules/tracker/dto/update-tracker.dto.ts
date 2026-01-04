import { IsEnum, IsOptional, IsUUID, IsDateString, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '../entities/job-tracker.entity';

export class UpdateTrackerDto {
    @ApiPropertyOptional({ enum: ApplicationStatus })
    @IsOptional()
    @IsEnum(ApplicationStatus)
    status?: ApplicationStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    cvId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    nextActionDate?: Date;
}
