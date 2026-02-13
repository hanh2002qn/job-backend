import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmCvImportDto {
  @ApiProperty({
    description: 'Session ID to confirm',
    example: 'uuid-here',
  })
  @IsUUID()
  sessionId: string;

  @ApiProperty({
    description: 'Optional adjustments to parsed data before confirming',
    required: false,
  })
  @IsOptional()
  adjustments?: {
    skills?: string[];
    experiences?: unknown[];
    projects?: unknown[];
  };
}
