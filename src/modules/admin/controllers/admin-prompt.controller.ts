import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import {
  AuditAction,
  AuditActionType,
  AuditModule,
} from '../../../common/decorators/audit-log.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AdminPromptService } from '../services/admin-prompt.service';
import { Prompt } from '../../ai/entities/prompt.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('Admin Prompts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/prompts')
export class AdminPromptController {
  constructor(private readonly adminPromptService: AdminPromptService) {}

  @Post()
  @AuditAction({ action: AuditActionType.CREATE_PROMPT, module: AuditModule.PROMPT })
  @ApiOperation({ summary: 'Create a new prompt' })
  @ApiResponse({ status: 201, description: 'Prompt created.', type: Prompt })
  create(@Body() createPromptDto: Partial<Prompt>): Promise<Prompt> {
    return this.adminPromptService.create(createPromptDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all prompts' })
  @ApiResponse({ status: 200, description: 'List of prompts returned.', type: [Prompt] })
  findAll(): Promise<Prompt[]> {
    return this.adminPromptService.findAll();
  }

  @Patch(':id')
  @AuditAction({ action: AuditActionType.UPDATE_PROMPT, module: AuditModule.PROMPT })
  @ApiOperation({ summary: 'Update a prompt' })
  @ApiParam({ name: 'id', description: 'Prompt ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Prompt updated.', type: Prompt })
  @ApiResponse({ status: 404, description: 'Prompt not found.' })
  update(@Param('id') id: string, @Body() updatePromptDto: Partial<Prompt>): Promise<Prompt> {
    return this.adminPromptService.update(id, updatePromptDto);
  }

  @Delete(':id')
  @AuditAction({ action: AuditActionType.DELETE_PROMPT, module: AuditModule.PROMPT })
  @ApiOperation({ summary: 'Delete a prompt' })
  @ApiParam({ name: 'id', description: 'Prompt ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Prompt deleted.' })
  @ApiResponse({ status: 404, description: 'Prompt not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.adminPromptService.remove(id);
  }
}
