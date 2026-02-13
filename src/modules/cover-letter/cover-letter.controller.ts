import { Controller, Post, Get, Body, UseGuards, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CoverLetterService } from './cover-letter.service';
import { GenerateCoverLetterDto } from './dto/generate-cover-letter.dto';
import { UpdateCoverLetterDto } from './dto/update-cover-letter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiFeatureGuard } from '../../common/guards/ai-feature.guard';
import { AiFeature } from '../../common/decorators/ai-feature.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('cover-letter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cover-letter')
export class CoverLetterController {
  constructor(private readonly coverLetterService: CoverLetterService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(AiFeatureGuard)
  @AiFeature('cover_letter')
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
  @Get(':id')
  @ApiOperation({ summary: 'Get Cover Letter detail' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.coverLetterService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Cover Letter' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: UpdateCoverLetterDto,
  ) {
    return this.coverLetterService.update(user.id, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Cover Letter' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.coverLetterService.remove(user.id, id);
  }
}
