import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CoverLetterService } from './cover-letter.service';
import { GenerateCoverLetterDto } from './dto/generate-cover-letter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('cover-letter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cover-letter')
export class CoverLetterController {
  constructor(private readonly coverLetterService: CoverLetterService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('generate')
  @ApiOperation({ summary: 'Generate a Cover Letter' })
  generate(@CurrentUser() user: User, @Body() generateDto: GenerateCoverLetterDto) {
    return this.coverLetterService.generate(user.id, generateDto);
  }

  @Get()
  @ApiOperation({ summary: 'List my cover letters' })
  findAll(@CurrentUser() user: User) {
    return this.coverLetterService.findAll(user.id);
  }
}
