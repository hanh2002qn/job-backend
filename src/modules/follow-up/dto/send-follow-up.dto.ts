import { IsDateString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendFollowUpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  followUpId: string;

  @ApiProperty({
    required: false,
    description: 'If provided, schedules the email.',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
