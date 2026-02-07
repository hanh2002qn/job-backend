import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a new prompt' })
  create(@Body() createPromptDto: Partial<Prompt>) {
    return this.adminPromptService.create(createPromptDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all prompts' })
  findAll() {
    return this.adminPromptService.findAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a prompt' })
  update(@Param('id') id: string, @Body() updatePromptDto: Partial<Prompt>) {
    return this.adminPromptService.update(id, updatePromptDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a prompt' })
  remove(@Param('id') id: string) {
    return this.adminPromptService.remove(id);
  }
}
