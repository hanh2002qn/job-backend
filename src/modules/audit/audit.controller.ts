import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit-log.entity';

interface AuditLogQuery {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  module?: string;
  status?: string;
}

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll(@Query() query: AuditLogQuery): Promise<{
    items: AuditLog[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    return this.auditService.findAll(query);
  }
}
