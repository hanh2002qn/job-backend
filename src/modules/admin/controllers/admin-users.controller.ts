import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
  NotFoundException,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from '../../users/users.service';
import { User, UserRole } from '../../users/entities/user.entity';

import { BaseSearchDto } from '../../../common/dto/base-search.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuditAction } from '../../../common/decorators/audit-log.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { BanUserDto } from '../dto/ban-user.dto';

@ApiTags('admin/users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Paginated list of users.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  async findAll(@Query() searchDto: BaseSearchDto): Promise<{
    data: User[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    return this.usersService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user detail' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, description: 'User detail returned.', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Patch(':id/ban')
  @AuditAction({ action: 'BAN_USER', module: 'USERS' })
  @ApiOperation({ summary: 'Ban or Unban a user' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, description: 'User ban status updated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async banUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BanUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    if (id === currentUser.id) {
      throw new ForbiddenException('Admins cannot ban themselves');
    }

    const target = await this.usersService.findOneById(id);
    if (!target) throw new NotFoundException('User not found');
    if (target.role === UserRole.ADMIN) {
      throw new ForbiddenException('Admins cannot ban other admins');
    }

    await this.usersService.update(id, { isBanned: dto.isBanned });
  }
}
