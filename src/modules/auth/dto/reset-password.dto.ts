import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({ example: 'newPassword123' })
    @IsNotEmpty()
    @MinLength(6)
    newPassword: string;

    @ApiProperty()
    @IsNotEmpty()
    token: string;
}
