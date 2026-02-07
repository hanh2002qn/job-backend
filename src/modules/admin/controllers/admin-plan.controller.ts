import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminPlanService } from '../services/admin-plan.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { Plan } from '../../subscription/entities/plan.entity';

@ApiTags('admin/plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/plans')
export class AdminPlanController {
  constructor(private readonly planService: AdminPlanService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subscription plans' })
  async findAll() {
    return this.planService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan detail' })
  async findOne(@Param('id') id: string) {
    return this.planService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new plan' })
  async create(@Body() createData: Partial<Plan>) {
    return this.planService.create(createData);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update plan (e.g., changes limits)' })
  async update(@Param('id') id: string, @Body() updateData: Partial<Plan>) {
    return this.planService.update(id, updateData);
  }
}
