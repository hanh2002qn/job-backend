import { IsNotEmpty, IsOptional, IsUUID, IsString } from 'class-validator';
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
}
