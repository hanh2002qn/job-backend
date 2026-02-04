import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobAlertService } from './job-alert.service';
import { UpdateJobAlertDto } from './dto/update-job-alert.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('job-alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('job-alerts')
export class JobAlertController {
  constructor(private readonly jobAlertService: JobAlertService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my job alert settings' })
  async getSettings(@CurrentUser() user: User) {
    return this.jobAlertService.getSettings(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my job alert settings' })
  async updateSettings(@CurrentUser() user: User, @Body() dto: UpdateJobAlertDto) {
    return this.jobAlertService.updateSettings(user.id, dto);
  }
}
