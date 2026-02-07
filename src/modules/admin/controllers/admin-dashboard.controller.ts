import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('admin/dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('chart/users')
  @ApiOperation({ summary: 'Get user growth chart data (last 30 days)' })
  async getUserGrowth() {
    return this.dashboardService.getUserGrowth();
  }

  @Post('maintenance')
  @ApiOperation({ summary: 'Toggle maintenance mode' })
  async toggleMaintenance(@Body('enabled') enabled: boolean) {
    await this.dashboardService.setMaintenanceMode(enabled);
    return { maintenance: enabled };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get recent transactions (charges)' })
  async getTransactions() {
    return this.dashboardService.getTransactions();
  }
}
