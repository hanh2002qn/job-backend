import { IsNotEmpty, IsOptional, IsUUID, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateCoverLetterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  jobId: string;

  @ApiProperty({
    description: 'professional | concise | friendly',
    default: 'professional',
  })
  @IsOptional()
  @IsString()
  tone?: string;

  @ApiProperty({
    description: 'en | vi',
    default: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ required: false, type: [Object] })
  @IsOptional()
  @IsArray()
  experience?: Record<string, unknown>[];
}
