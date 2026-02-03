import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  exportCv(@CurrentUser() user: User, @Body() exportDto: ExportCvDto) {
    return this.exportService.exportCv(user.id, exportDto);
  }
}
