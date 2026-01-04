import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CoverLetterService } from './cover-letter.service';
import { GenerateCoverLetterDto } from './dto/generate-cover-letter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('cover-letter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cover-letter')
export class CoverLetterController {
    constructor(private readonly coverLetterService: CoverLetterService) { }

    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('generate')
    @ApiOperation({ summary: 'Generate a Cover Letter' })
    generate(@Request() req, @Body() generateDto: GenerateCoverLetterDto) {
        return this.coverLetterService.generate(req.user.id, generateDto);
    }

    @Get()
    @ApiOperation({ summary: 'List my cover letters' })
    findAll(@Request() req) {
        return this.coverLetterService.findAll(req.user.id);
    }
}
