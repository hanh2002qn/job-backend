import { Controller, Post, Body, UseGuards, Patch, Param, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { FollowUpService } from './follow-up.service';
import { GenerateFollowUpDto } from './dto/generate-follow-up.dto';
import { SendFollowUpDto } from './dto/send-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiFeatureGuard } from '../../common/guards/ai-feature.guard';
import { AiFeature } from '../../common/decorators/ai-feature.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('follow-up')
@Controller('follow-up')
export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AiFeatureGuard)
  @AiFeature('follow_up_email')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('generate')
  @ApiOperation({ summary: 'Generate a follow-up email draft' })
  generate(@CurrentUser() user: User, @Body() generateDto: GenerateFollowUpDto) {
    return this.followUpService.generate(user.id, generateDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a follow-up draft content' })
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() updateDto: UpdateFollowUpDto) {
    return this.followUpService.update(user.id, id, updateDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('send')
  @ApiOperation({ summary: 'Send or schedule a follow-up email' })
  send(@CurrentUser() user: User, @Body() sendDto: SendFollowUpDto) {
    return this.followUpService.sendOrSchedule(user.id, sendDto);
  }

  @Get('track/:token')
  @ApiOperation({ summary: 'Track email open' })
  async track(@Param('token') token: string, @Res() res: Response) {
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
