import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../../users/users.service';
import { User, UserRole } from '../../users/entities/user.entity';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UpdateResult } from 'typeorm';

@ApiTags('admin/users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll(@Query() paginationDto: PaginationDto): Promise<{
    data: User[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    return this.usersService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user detail' })
  async findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOneById(id);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Update user role' })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
  ): Promise<UpdateResult> {
    return this.usersService.update(id, { role: updateRoleDto.role });
  }
}
