import { Controller, Post, Get, Body, UseGuards, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CvService } from './cv.service';
import { GenerateCvDto } from './dto/generate-cv.dto';
import { TailorCvDto } from './dto/tailor-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CV } from './entities/cv.entity';
import { CvVersion } from './entities/cv-version.entity';

@ApiTags('cv')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(SubscriptionGuard)
  @Post('generate')
  @ApiOperation({ summary: 'Generate a CV for a specific job' })
  @ApiResponse({ status: 201, description: 'CV generated successfully.', type: CV })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Subscription or AI feature limit reached.' })
  generate(@CurrentUser() user: User, @Body() generateDto: GenerateCvDto): Promise<CV> {
    return this.cvService.generate(user.id, generateDto);
  }

  @Get()
  @ApiOperation({ summary: 'List my generated CVs' })
  @ApiResponse({ status: 200, description: 'List of CVs.', type: [CV] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@CurrentUser() user: User): Promise<CV[]> {
    return this.cvService.findAll(user.id);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List available CV templates' })
  @ApiResponse({ status: 200, description: 'List of CV templates.' })
  getTemplates(): { id: string; name: string; type: string }[] {
    return this.cvService.getTemplates();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get CV detail' })
  @ApiParam({ name: 'id', description: 'CV ID (UUID)' })
  @ApiResponse({ status: 200, description: 'CV detail returned.', type: CV })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'CV not found.' })
  findOne(@CurrentUser() user: User, @Param('id') id: string): Promise<CV> {
    return this.cvService.findOne(user.id, id);
  }

  @Post(':id/tailor')
  @ApiOperation({ summary: 'Re-tailor an existing CV for a new job' })
  @ApiParam({ name: 'id', description: 'CV ID (UUID)' })
  @ApiResponse({ status: 201, description: 'CV tailored successfully.', type: CV })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'CV not found.' })
  tailor(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: TailorCvDto,
  ): Promise<CV> {
    return this.cvService.tailor(user.id, id, dto.jobId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update CV content and name' })
  @ApiParam({ name: 'id', description: 'CV ID (UUID)' })
  @ApiResponse({ status: 200, description: 'CV updated.', type: CV })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'CV not found.' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateCvDto,
  ): Promise<CV> {
    return this.cvService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a CV' })
  @ApiParam({ name: 'id', description: 'CV ID (UUID)' })
  @ApiResponse({ status: 200, description: 'CV deleted.', type: CV })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'CV not found.' })
  remove(@CurrentUser() user: User, @Param('id') id: string): Promise<CV> {
    return this.cvService.remove(user.id, id);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get version history of a CV' })
  @ApiParam({ name: 'id', description: 'CV ID (UUID)' })
  @ApiResponse({ status: 200, description: 'CV versions returned.', type: [CvVersion] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'CV not found.' })
  getVersions(@CurrentUser() user: User, @Param('id') id: string): Promise<CvVersion[]> {
    return this.cvService.getVersions(user.id, id);
  }

  @Post(':id/versions/:versionId/restore')
  @ApiOperation({ summary: 'Restore a previous version' })
  @ApiParam({ name: 'id', description: 'CV ID (UUID)' })
  @ApiParam({ name: 'versionId', description: 'Version ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Version restored.', type: CV })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'CV or version not found.' })
  restoreVersion(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ): Promise<CV> {
    return this.cvService.restoreVersion(user.id, id, versionId);
  }

  @Get(':id/html')
  @ApiOperation({ summary: 'Get CV HTML for client-side rendering/printing' })
  @ApiParam({ name: 'id', description: 'CV ID (UUID)' })
  @ApiResponse({ status: 200, description: 'CV HTML returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'CV not found.' })
  async getHtml(@CurrentUser() user: User, @Param('id') id: string): Promise<{ html: string }> {
    const html = await this.cvService.getHtml(user.id, id);
    return { html };
  }
}
