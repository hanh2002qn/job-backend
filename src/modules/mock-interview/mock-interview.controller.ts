import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MockInterviewService } from './mock-interview.service';
import { StartInterviewDto, SubmitAnswerDto } from './dto/mock-interview.dto';
import type { AuthenticatedRequest } from '../../common/interfaces';

@ApiTags('mock-interview')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mock-interview')
export class MockInterviewController {
  constructor(private readonly mockInterviewService: MockInterviewService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new AI mock interview session' })
  async start(@Req() req: AuthenticatedRequest, @Body() dto: StartInterviewDto) {
    return this.mockInterviewService.start(req.user.id, dto);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Restart an existing interview session' })
  async retry(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.mockInterviewService.retry(req.user.id, id);
  }

  @Post(':id/answer')
  @ApiOperation({ summary: 'Submit an answer to the interview question' })
  async submitAnswer(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.mockInterviewService.submitAnswer(req.user.id, id, dto.answer);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user interview history' })
  async getHistory(@Req() req: AuthenticatedRequest) {
    return this.mockInterviewService.getHistory(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get interview session detail' })
  async getDetail(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.mockInterviewService.getDetail(req.user.id, id);
  }
}
