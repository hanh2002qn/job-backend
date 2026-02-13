import { Controller, Post, Get, Body, Param, UseGuards, Req, Sse } from '@nestjs/common';
import { Observable, from, map } from 'rxjs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiFeatureGuard } from '../../common/guards/ai-feature.guard';
import { AiFeature } from '../../common/decorators/ai-feature.decorator';
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
  @UseGuards(AiFeatureGuard)
  @AiFeature('mock_interview')
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

  @Sse(':id/answer-stream')
  @ApiOperation({ summary: 'Submit an answer and stream the AI response' })
  submitAnswerStream(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: SubmitAnswerDto,
  ): Observable<{ data: string }> {
    const stream = this.mockInterviewService.submitAnswerStream(req.user.id, id, dto.answer);
    return from(stream).pipe(map((chunk) => ({ data: chunk })));
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

  @Post(':id/delete')
  @ApiOperation({ summary: 'Delete an interview session' })
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return await this.mockInterviewService.remove(req.user.id, id);
  }
}
