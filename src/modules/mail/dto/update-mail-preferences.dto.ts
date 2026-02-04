import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMailPreferencesDto {
  @ApiPropertyOptional({ description: 'Receive job alert emails' })
  @IsBoolean()
  @IsOptional()
  jobAlerts?: boolean;

  @ApiPropertyOptional({ description: 'Receive application reminders' })
  @IsBoolean()
  @IsOptional()
  applicationReminders?: boolean;

  @ApiPropertyOptional({ description: 'Receive marketing and tip emails' })
  @IsBoolean()
  @IsOptional()
  marketing?: boolean;
}
