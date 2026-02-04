import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({
    description: 'Note content',
    example: 'Follow up after phone screen',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;
}

export class UpdateNoteDto {
  @ApiProperty({
    description: 'Updated note content',
    example: 'Completed phone screen, waiting for next steps',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;
}
