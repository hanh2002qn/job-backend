import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CvService } from './cv.service';
import { GenerateCvDto } from './dto/generate-cv.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';

@ApiTags('cv')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cv')
export class CvController {
    constructor(private readonly cvService: CvService) { }

    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @UseGuards(SubscriptionGuard)
    @Post('generate')
    @ApiOperation({ summary: 'Generate a CV for a specific job' })
    generate(@Request() req, @Body() generateDto: GenerateCvDto) {
        return this.cvService.generate(req.user.id, generateDto);
    }

    @Get()
    @ApiOperation({ summary: 'List my generated CVs' })
    findAll(@Request() req) {
        return this.cvService.findAll(req.user.id);
    }
}
