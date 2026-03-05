import { Controller, Post, Body, UseGuards, Patch, Param, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { FollowUpService } from './follow-up.service';
import { GenerateFollowUpDto } from './dto/generate-follow-up.dto';
import { SendFollowUpDto } from './dto/send-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { FollowUp } from './entities/follow-up.entity';

@ApiTags('follow-up')
@Controller('follow-up')
export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('generate')
  @ApiOperation({ summary: 'Generate a follow-up email draft' })
  @ApiResponse({ status: 201, description: 'Follow-up email generated.', type: FollowUp })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded.' })
  generate(@CurrentUser() user: User, @Body() generateDto: GenerateFollowUpDto): Promise<FollowUp> {
    return this.followUpService.generate(user.id, generateDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a follow-up draft content' })
  @ApiParam({ name: 'id', description: 'Follow-up ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Follow-up updated.', type: FollowUp })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Follow-up not found.' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: UpdateFollowUpDto,
  ): Promise<FollowUp> {
    return this.followUpService.update(user.id, id, updateDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('send')
  @ApiOperation({ summary: 'Send or schedule a follow-up email' })
  @ApiResponse({ status: 201, description: 'Follow-up sent or scheduled.', type: FollowUp })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  send(@CurrentUser() user: User, @Body() sendDto: SendFollowUpDto): Promise<FollowUp> {
    return this.followUpService.sendOrSchedule(user.id, sendDto);
  }

  @Get('track/:token')
  @ApiOperation({ summary: 'Track email open' })
  @ApiParam({ name: 'token', description: 'Tracking token' })
  @ApiResponse({ status: 200, description: '1x1 transparent pixel returned.' })
  async track(@Param('token') token: string, @Res() res: Response): Promise<void> {
    await this.followUpService.markAsOpened(token);

    // Return 1x1 transparent PNG
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64',
    );
    res.set('Content-Type', 'image/png');
    res.set('Content-Length', pixel.length.toString());
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send(pixel);
  }
}
