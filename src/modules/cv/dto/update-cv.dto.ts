import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { CvContent } from '../interfaces/cv.interface';

export class UpdateCvDto {
  @ApiProperty({ description: 'New name for the CV', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Updated CV content', required: false })
  @IsObject()
  @IsOptional()
  content?: CvContent;

  @ApiProperty({ description: 'Template to use', required: false })
  @IsString()
  @IsOptional()
  template?: string;
}
