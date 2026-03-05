import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseSearchDto } from '../../../common/dto/base-search.dto';
import { UserRole } from '../entities/user.entity';

export enum UserStatusFilter {
  ACTIVE = 'active',
  BANNED = 'banned',
}

export class UserSearchDto extends BaseSearchDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserStatusFilter })
  @IsOptional()
  @IsEnum(UserStatusFilter)
  status?: UserStatusFilter;
}
