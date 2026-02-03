import { IsArray, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EducationRecord, ExperienceRecord } from '../interfaces/profile.interface';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'List of education records',
    example: [{ school: 'MIT', degree: 'BS' }],
  })
  @IsArray()
  @IsOptional()
  education?: EducationRecord[];

  @ApiProperty({
    description: 'List of experience records',
    example: [{ company: 'Google', role: 'Engineer' }],
  })
  @IsArray()
  @IsOptional()
  experience?: ExperienceRecord[];

  @ApiProperty({ description: 'List of skills', example: ['Node.js', 'React'] })
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiProperty({ required: false, example: 'https://linkedin.com/in/johndoe' })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiProperty({ required: false, example: 'https://johndoe.com' })
  @IsOptional()
  @IsString()
  portfolio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Job preferences: Industries',
    example: ['IT', 'Design'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  preferredIndustries?: string[];

  @ApiProperty({
    description: 'Job preferences: Job Types',
    example: ['Full-time', 'Remote'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  preferredJobTypes?: string[];

  @ApiProperty({
    description: 'Job preferences: Locations',
    example: ['Hà Nội', 'Hồ Chí Minh'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  preferredLocations?: string[];

  @ApiProperty({
    description: 'Minimum salary expectation',
    example: 10000000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  minSalaryExpectation?: number;
}
