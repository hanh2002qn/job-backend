import { Controller, Post, Get, Body, UseGuards, Param, Patch, Delete, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CvService } from './cv.service';
import { GenerateCvDto } from './dto/generate-cv.dto';
import { TailorCvDto } from './dto/tailor-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

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
  generate(@CurrentUser() user: User, @Body() generateDto: GenerateCvDto) {
    return this.cvService.generate(user.id, generateDto);
  }

  @Get()
  @ApiOperation({ summary: 'List my generated CVs' })
  findAll(@CurrentUser() user: User) {
    return this.cvService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get CV detail' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.cvService.findOne(user.id, id);
  }

  @Post(':id/tailor')
  @ApiOperation({ summary: 'Re-tailor an existing CV for a new job' })
  tailor(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: TailorCvDto) {
    return this.cvService.tailor(user.id, id, dto.jobId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update CV content and name' })
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateCvDto) {
    return this.cvService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a CV' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.cvService.remove(user.id, id);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get version history of a CV' })
  getVersions(@CurrentUser() user: User, @Param('id') id: string) {
    return this.cvService.getVersions(user.id, id);
  }

  @Post(':id/versions/:versionId/restore')
  @ApiOperation({ summary: 'Restore a previous version' })
  restoreVersion(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ) {
    return this.cvService.restoreVersion(user.id, id, versionId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download CV as PDF' })
  async download(@CurrentUser() user: User, @Param('id') id: string, @Res() res: Response) {
    const buffer = await this.cvService.downloadPdf(user.id, id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cv-${id}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
