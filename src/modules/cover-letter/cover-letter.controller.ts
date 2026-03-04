import { Controller, Post, Get, Body, UseGuards, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CoverLetterService } from './cover-letter.service';
import { GenerateCoverLetterDto } from './dto/generate-cover-letter.dto';
import { UpdateCoverLetterDto } from './dto/update-cover-letter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiFeatureGuard } from '../../common/guards/ai-feature.guard';
import { AiFeature } from '../../common/decorators/ai-feature.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CoverLetter } from './entities/cover-letter.entity';

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
  @ApiResponse({ status: 201, description: 'Cover letter generated.', type: CoverLetter })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'AI feature limit reached.' })
  generate(
    @CurrentUser() user: User,
    @Body() generateDto: GenerateCoverLetterDto,
  ): Promise<CoverLetter> {
    return this.coverLetterService.generate(user.id, generateDto);
  }

  @Get()
  @ApiOperation({ summary: 'List my cover letters' })
  @ApiResponse({ status: 200, description: 'List of cover letters.', type: [CoverLetter] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@CurrentUser() user: User): Promise<CoverLetter[]> {
    return this.coverLetterService.findAll(user.id);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get Cover Letter detail' })
  @ApiParam({ name: 'id', description: 'Cover Letter ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Cover letter detail returned.', type: CoverLetter })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Cover letter not found.' })
  findOne(@CurrentUser() user: User, @Param('id') id: string): Promise<CoverLetter> {
    return this.coverLetterService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Cover Letter' })
  @ApiParam({ name: 'id', description: 'Cover Letter ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Cover letter updated.', type: CoverLetter })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Cover letter not found.' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: UpdateCoverLetterDto,
  ): Promise<CoverLetter> {
    return this.coverLetterService.update(user.id, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Cover Letter' })
  @ApiParam({ name: 'id', description: 'Cover Letter ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Cover letter deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Cover letter not found.' })
  remove(@CurrentUser() user: User, @Param('id') id: string): Promise<void> {
    return this.coverLetterService.remove(user.id, id);
  }
}
