import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CvService } from './cv.service';
import { GenerateCvDto } from './dto/generate-cv.dto';
import { TailorCvDto } from './dto/tailor-cv.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('cv')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(SubscriptionGuard)
  @Post('generate')
  @ApiOperation({ summary: 'Generate a CV for a specific job' })
  generate(@CurrentUser() user: User, @Body() generateDto: GenerateCvDto) {
    return this.cvService.generate(user.id, generateDto);
  }

  @Get()
  @ApiOperation({ summary: 'List my generated CVs' })
  findAll(@CurrentUser() user: User) {
    return this.cvService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get CV detail' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.cvService.findOne(user.id, id);
  }

  @Post(':id/tailor')
  @ApiOperation({ summary: 'Re-tailor an existing CV for a new job' })
  tailor(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: TailorCvDto) {
    return this.cvService.tailor(user.id, id, dto.jobId);
  }
}
