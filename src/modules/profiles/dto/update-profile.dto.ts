import { IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiProperty({ description: 'List of education records', example: [{ school: 'MIT', degree: 'BS' }] })
    @IsArray()
    @IsOptional()
    education?: Record<string, any>[];

    @ApiProperty({ description: 'List of experience records', example: [{ company: 'Google', role: 'Engineer' }] })
    @IsArray()
    @IsOptional()
    experience?: Record<string, any>[];

    @ApiProperty({ description: 'List of skills', example: ['Node.js', 'React'] })
    @IsArray()
    @IsOptional()
    skills?: string[];
}
