import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFollowUpDto {
  @ApiProperty({ example: 'Subject: ...\n\nBody: ...' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
