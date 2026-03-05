import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BanUserDto {
  @ApiProperty({ description: 'Whether to ban (true) or unban (false) the user' })
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;
}
