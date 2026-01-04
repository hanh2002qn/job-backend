import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FollowUpService } from './follow-up.service';
import { GenerateFollowUpDto } from './dto/generate-follow-up.dto';
import { SendFollowUpDto } from './dto/send-follow-up.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('follow-up')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('follow-up')
export class FollowUpController {
    constructor(private readonly followUpService: FollowUpService) { }

    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('generate')
    @ApiOperation({ summary: 'Generate a follow-up email draft' })
    generate(@Request() req, @Body() generateDto: GenerateFollowUpDto) {
        return this.followUpService.generate(req.user.id, generateDto);
    }

    @Post('send')
    @ApiOperation({ summary: 'Send or schedule a follow-up email' })
    send(@Request() req, @Body() sendDto: SendFollowUpDto) {
        return this.followUpService.sendOrSchedule(req.user.id, sendDto);
    }
}
