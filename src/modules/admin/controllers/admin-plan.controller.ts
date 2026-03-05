import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AdminPlanService } from '../services/admin-plan.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { Plan } from '../../subscription/entities/plan.entity';
import { CreatePlanDto, UpdatePlanDto } from '../dto/plan.dto';

@ApiTags('admin/plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/plans')
export class AdminPlanController {
  constructor(private readonly planService: AdminPlanService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiResponse({ status: 200, description: 'List of plans returned.', type: [Plan] })
  async findAll(): Promise<Plan[]> {
    return this.planService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan detail' })
  @ApiParam({ name: 'id', description: 'Plan ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Plan detail returned.', type: Plan })
  @ApiResponse({ status: 404, description: 'Plan not found.' })
  async findOne(@Param('id') id: string): Promise<Plan> {
    return this.planService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new plan' })
  @ApiBody({ type: CreatePlanDto })
  @ApiResponse({ status: 201, description: 'Plan created.', type: Plan })
  async create(@Body() createData: CreatePlanDto): Promise<Plan> {
    return this.planService.create(createData);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update plan (e.g., changes limits)' })
  @ApiParam({ name: 'id', description: 'Plan ID (UUID)' })
  @ApiBody({ type: UpdatePlanDto })
  @ApiResponse({ status: 200, description: 'Plan updated.', type: Plan })
  @ApiResponse({ status: 404, description: 'Plan not found.' })
  async update(@Param('id') id: string, @Body() updateData: UpdatePlanDto): Promise<Plan> {
    return this.planService.update(id, updateData);
  }
}
