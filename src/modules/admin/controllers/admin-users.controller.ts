import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  NotFoundException,
  ForbiddenException,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from '../../users/users.service';
import { User, UserRole } from '../../users/entities/user.entity';

import { BaseSearchDto } from '../../../common/dto/base-search.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import {
  AuditAction,
  AuditActionType,
  AuditModule,
} from '../../../common/decorators/audit-log.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { BanUserDto } from '../dto/ban-user.dto';
import { ChangeRoleDto } from '../dto/change-role.dto';
import { PaginatedResponseDto } from '../../../common/dto/pagination.dto';

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
  async findAll(@Query() searchDto: BaseSearchDto): Promise<PaginatedResponseDto<User>> {
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
  @AuditAction({ action: AuditActionType.BAN_USER, module: AuditModule.USERS })
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

  @Patch(':id/role')
  @AuditAction({ action: AuditActionType.CHANGE_USER_ROLE, module: AuditModule.USERS })
  @ApiOperation({ summary: 'Change user role' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, description: 'User role updated.' })
  @ApiResponse({ status: 403, description: 'Cannot change own role.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async changeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeRoleDto,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    if (id === currentUser.id) {
      throw new ForbiddenException('Admins cannot change their own role');
    }

    const target = await this.usersService.findOneById(id);
    if (!target) throw new NotFoundException('User not found');

    await this.usersService.update(id, { role: dto.role });
  }

  @Patch(':id/verify')
  @AuditAction({ action: AuditActionType.VERIFY_USER, module: AuditModule.USERS })
  @ApiOperation({ summary: 'Manually verify a user email' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, description: 'User verified.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async verifyUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const target = await this.usersService.findOneById(id);
    if (!target) throw new NotFoundException('User not found');

    await this.usersService.update(id, { isVerified: true });
  }

  @Delete(':id')
  @AuditAction({ action: AuditActionType.DELETE_USER, module: AuditModule.USERS })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 204, description: 'User deleted.' })
  @ApiResponse({ status: 403, description: 'Cannot delete own account.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    if (id === currentUser.id) {
      throw new ForbiddenException('Admins cannot delete their own account');
    }

    const target = await this.usersService.findOneById(id);
    if (!target) throw new NotFoundException('User not found');

    await this.usersService.delete(id);
  }
}
