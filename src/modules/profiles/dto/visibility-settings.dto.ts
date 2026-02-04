import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class VisibilitySettingsDto {
  @ApiProperty({ description: 'Show email in public profile', default: false })
  @IsBoolean()
  @IsOptional()
  showEmail?: boolean;

  @ApiProperty({ description: 'Show phone in public profile', default: false })
  @IsBoolean()
  @IsOptional()
  showPhone?: boolean;

  @ApiProperty({ description: 'Show salary expectation', default: false })
  @IsBoolean()
  @IsOptional()
  showSalary?: boolean;

  @ApiProperty({ description: 'Show social links (LinkedIn, Portfolio)', default: true })
  @IsBoolean()
  @IsOptional()
  showSocials?: boolean;
}

export class UpdateVisibilityDto {
  @ApiProperty({ description: 'Make profile public/private', default: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({ type: VisibilitySettingsDto })
  @ValidateNested()
  @Type(() => VisibilitySettingsDto)
  @IsOptional()
  visibilitySettings?: VisibilitySettingsDto;
}
