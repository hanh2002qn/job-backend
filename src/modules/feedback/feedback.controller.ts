import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import type { Request } from 'express';
import { User } from '../users/entities/user.entity';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit feedback' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        category: { type: 'string' },
        rating: { type: 'number' },
        contactEmail: { type: 'string' },
      },
      required: ['content'],
    },
  })
  async create(
    @Req() req: Request,
    @Body() body: { content: string; category?: string; rating?: number; contactEmail?: string },
  ) {
    const user = req.user as User | undefined;
    return this.feedbackService.create(
      body.content,
      body.category,
      body.rating,
      user,
      body.contactEmail,
    );
  }
}
