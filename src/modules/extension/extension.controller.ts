import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ExtensionService } from './extension.service';
import { ExtensionEventDto, JobStatusResponseDto } from './dto/extension-event.dto';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { sub: string; email?: string };
}

@ApiTags('Extension')
@Controller('extension')
export class ExtensionController {
  constructor(private readonly extensionService: ExtensionService) {}

  @Post('events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Handle events from browser extension' })
  async handleEvent(@Body() dto: ExtensionEventDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.extensionService.handleEvent(userId, dto);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get application status for a job URL' })
  @ApiQuery({ name: 'jobUrl', description: 'URL of the job page' })
  async getJobStatus(
    @Query('jobUrl') jobUrl: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<JobStatusResponseDto> {
    const userId = req.user.sub;
    return this.extensionService.getJobStatus(userId, jobUrl);
  }

  @Get('ping')
  @ApiOperation({ summary: 'Health check for extension' })
  ping() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
