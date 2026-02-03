import { IsNotEmpty, IsString, IsUrl, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExtractJobDto {
  @ApiProperty({ description: 'The raw text content or HTML from the job page' })
  @IsNotEmpty()
  @IsString()
  rawContent: string;

  @ApiProperty({ description: 'The URL of the job page' })
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @ApiProperty({ description: 'Platform name (e.g., topcv, linkedin)', required: false })
  @IsOptional()
  @IsString()
  platform?: string;
}
