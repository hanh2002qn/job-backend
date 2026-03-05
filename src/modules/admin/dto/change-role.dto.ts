import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

export class ChangeRoleDto {
  @ApiProperty({ enum: UserRole, description: 'New role for the user' })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
