import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompletenessQueryDto {
  @ApiProperty({
    description: 'Target role to calculate completeness for',
    example: 'Backend Developer',
    required: false,
  })
  @IsString()
  @IsOptional()
  targetRole?: string;
}
