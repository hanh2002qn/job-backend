import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExportService } from './export.service';
import { ExportCvDto } from './dto/export-cv.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('cv')
  @ApiOperation({ summary: 'Export CV to PDF/DOCX' })
  exportCv(@Request() req, @Body() exportDto: ExportCvDto) {
    return this.exportService.exportCv(req.user.id, exportDto);
  }
}
