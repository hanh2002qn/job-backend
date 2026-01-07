import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ExportFormat {
  PDF = 'pdf',
  DOCX = 'docx',
}

export class ExportCvDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  cvId: string;

  @ApiProperty({ enum: ExportFormat, default: ExportFormat.PDF })
  @IsNotEmpty()
  @IsEnum(ExportFormat)
  format: ExportFormat;
}
