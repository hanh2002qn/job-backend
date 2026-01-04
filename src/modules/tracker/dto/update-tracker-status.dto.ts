import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '../entities/job-tracker.entity';

export class UpdateTrackerStatusDto {
    @ApiProperty({ enum: ApplicationStatus })
    @IsNotEmpty()
    @IsEnum(ApplicationStatus)
    status: ApplicationStatus;
}
