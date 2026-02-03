import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SkillRoadmapService } from './skill-roadmap.service';
import { GenerateRoadmapDto } from './dto/skill-roadmap.dto';
import type { AuthenticatedRequest } from '../../common/interfaces';

@ApiTags('skill-roadmap')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('skill-roadmap')
export class SkillRoadmapController {
  constructor(private readonly roadmapService: SkillRoadmapService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a personalized career roadmap' })
  generate(@Req() req: AuthenticatedRequest, @Body() dto: GenerateRoadmapDto) {
    return this.roadmapService.generate(req.user.id, dto);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get the latest generated roadmap' })
  getLatest(@Req() req: AuthenticatedRequest) {
    return this.roadmapService.getLatest(req.user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get all generated roadmaps' })
  findAll(@Req() req: AuthenticatedRequest) {
    return this.roadmapService.findAll(req.user.id);
  }
}
