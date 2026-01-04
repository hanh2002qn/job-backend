import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateCvDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    jobId: string; // The job to target

    @ApiProperty({ required: false })
    @IsOptional()
    template?: string;
}
