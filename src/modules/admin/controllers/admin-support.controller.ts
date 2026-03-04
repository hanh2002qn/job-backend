import { Controller, Post, Param, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../../users/users.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { User, UserRole } from '../../users/entities/user.entity';
import { AuditAction } from '../../../common/decorators/audit-log.decorator';

@ApiTags('Admin Support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/support')
export class AdminSupportController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('users/:id/impersonate')
  @AuditAction({ action: 'IMPERSONATE_USER', module: 'SUPPORT' })
  @ApiOperation({ summary: 'Impersonate a user (get access token)' })
  async impersonateUser(
    @Param('id') userId: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: Omit<User, 'passwordHash'> }> {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // We need to cast or ensure user matches what getTokens expects
    // getTokens expects Omit<User, 'passwordHash'>.
    // The user from findOneById likely has passwordHash nullable,
    // so we should probably strip it or rely on structure compatibility.
    // However, findOneById returns User | null.

    // Let's strip sensitive fields just in case
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return this.authService.getTokens(safeUser);
  }
}
