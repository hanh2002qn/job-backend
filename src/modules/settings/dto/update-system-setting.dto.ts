import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSystemSettingDto {
  @ApiPropertyOptional()
  @IsOptional()
  value?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
