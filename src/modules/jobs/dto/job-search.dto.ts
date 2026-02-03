import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { City, Industry, JobLevel, JobType } from '../enums/job.enums';
import { BaseSearchDto } from '../../../common/dto/base-search.dto';

export enum JobSortBy {
  CREATED_AT = 'createdAt',
  POSTED_AT = 'postedAt',
  SALARY_MAX = 'salaryMax',
  DEADLINE = 'deadline',
}

export class JobSearchDto extends BaseSearchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: City })
  @IsOptional()
  @IsEnum(City)
  city?: City;

  @ApiPropertyOptional({ enum: JobLevel })
  @IsOptional()
  @IsEnum(JobLevel)
  experienceLevel?: JobLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level?: string; // Staff, Manager...

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ enum: Industry })
  @IsOptional()
  @IsEnum(Industry)
  industry?: Industry;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minSalary?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxSalary?: number;

  @ApiPropertyOptional({ enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiPropertyOptional({ enum: JobSortBy, default: JobSortBy.POSTED_AT })
  @IsOptional()
  @IsEnum(JobSortBy)
  sortBy?: JobSortBy = JobSortBy.POSTED_AT;
}
