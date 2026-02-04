import { Controller, Post, Body, UseGuards, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { ExportCvDto } from './dto/export-cv.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('cv')
  @ApiOperation({ summary: 'Export CV to PDF/DOCX' })
  async exportCv(@CurrentUser() user: User, @Body() exportDto: ExportCvDto, @Res() res: Response) {
    const result = await this.exportService.exportCv(user.id, exportDto);
    res.set({
      'Content-Type': result.contentType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': result.buffer.length,
    });
    res.end(result.buffer);
  }

  @Get('tracker/csv')
  @ApiOperation({ summary: 'Export Job Tracker to CSV' })
  async exportTrackerCsv(@CurrentUser() user: User, @Res() res: Response) {
    const result = await this.exportService.exportTrackerCsv(user.id);
    res.set({
      'Content-Type': result.contentType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': result.buffer.length,
    });
    res.end(result.buffer);
  }
}
