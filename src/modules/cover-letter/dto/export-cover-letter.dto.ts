import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExportFormat } from '../../export/dto/export-cv.dto';

export class ExportCoverLetterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  coverLetterId: string;

  @ApiProperty({ enum: ExportFormat })
  @IsEnum(ExportFormat)
  format: ExportFormat;
}
