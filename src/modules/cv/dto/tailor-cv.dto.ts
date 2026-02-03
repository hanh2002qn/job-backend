import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TailorCvDto {
  @ApiProperty({ description: 'The target job ID to tailor this CV for' })
  @IsNotEmpty()
  @IsUUID()
  jobId: string;
}
