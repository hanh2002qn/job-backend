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

    @ApiProperty({ required: false, example: 'https://linkedin.com/in/johndoe' })
    @IsOptional()
    linkedin?: string;

    @ApiProperty({ required: false, example: 'https://johndoe.com' })
    @IsOptional()
    portfolio?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    fullName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    address?: string;
}
