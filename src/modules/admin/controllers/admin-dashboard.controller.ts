import { Controller, Get, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { AuditAction } from '../../../common/decorators/audit-log.decorator';
import Stripe from 'stripe';

@ApiTags('admin/dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/dashboard')
@UseInterceptors(CacheInterceptor)
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('stats')
  @CacheTTL(600) // 10 minutes
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats(): Promise<{
    users: { total: number };
    jobs: { total: number; active: number };
    cvs: { total: number };
    subscriptions: {
      total: number;
      active: number;
      breakdown: { monthly: number; yearly: number };
    };
  }> {
    return this.dashboardService.getStats();
  }

  @Get('chart/users')
  @CacheTTL(3600) // 1 hour
  @ApiOperation({ summary: 'Get user growth chart data (last 30 days)' })
  async getUserGrowth(): Promise<{ date: string; count: number }[]> {
    return this.dashboardService.getUserGrowth();
  }

  @Post('maintenance')
  @AuditAction({ action: 'TOGGLE_MAINTENANCE', module: 'DASHBOARD' })
  @ApiOperation({ summary: 'Toggle maintenance mode' })
  async toggleMaintenance(@Body('enabled') enabled: boolean): Promise<{ maintenance: boolean }> {
    await this.dashboardService.setMaintenanceMode(enabled);
    return { maintenance: enabled };
  }

  @Get('transactions')
  @CacheTTL(600) // 10 minutes
  @ApiOperation({ summary: 'Get recent transactions (charges)' })
  async getTransactions(): Promise<
    {
      id: string;
      amount: number;
      currency: string;
      status: Stripe.Charge.Status;
      created: Date;
      customer: string | Stripe.Customer | Stripe.DeletedCustomer | null;
      receipt_url: string | null;
    }[]
  > {
    return this.dashboardService.getTransactions();
  }
}
