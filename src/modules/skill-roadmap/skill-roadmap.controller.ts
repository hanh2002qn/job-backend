import { Controller, Post, Get, Body, UseGuards, Req, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiFeatureGuard } from '../../common/guards/ai-feature.guard';
import { AiFeature } from '../../common/decorators/ai-feature.decorator';
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
  @UseGuards(AiFeatureGuard)
  @AiFeature('skill_roadmap')
  @ApiOperation({ summary: 'Generate a personalized career roadmap' })
  generate(@Req() req: AuthenticatedRequest, @Body() dto: GenerateRoadmapDto) {
    return this.roadmapService.generate(req.user.id, dto);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get the latest generated roadmap' })
  getLatest(@Req() req: AuthenticatedRequest) {
    return this.roadmapService.getLatest(req.user.id);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update progress of a roadmap topic' })
  updateProgress(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { phaseIndex: number; topicIndex: number; isCompleted: boolean },
  ) {
    return this.roadmapService.updateProgress(
      req.user.id,
      id,
      body.phaseIndex,
      body.topicIndex,
      body.isCompleted,
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Get all generated roadmaps' })
  findAll(@Req() req: AuthenticatedRequest) {
    return this.roadmapService.findAll(req.user.id);
  }
}
