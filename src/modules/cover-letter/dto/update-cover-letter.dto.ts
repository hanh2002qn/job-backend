import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCoverLetterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  language?: string;
}
