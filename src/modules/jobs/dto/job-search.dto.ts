import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class JobSearchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional()
  @IsOptional()
  minSalary?: number;

  @ApiPropertyOptional()
  @IsOptional()
  maxSalary?: number;

  @ApiPropertyOptional() // Remote, Hybrid, Onsite
  @IsOptional()
  @IsString()
  jobType?: string;
}
