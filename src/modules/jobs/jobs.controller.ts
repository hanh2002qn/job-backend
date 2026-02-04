import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JobSearchDto } from './dto/job-search.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search jobs with full-text search' })
  async search(@Query() query: JobSearchDto) {
    return this.jobsService.findAll(query);
  }

  @Get('saved')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get saved/bookmarked jobs' })
  async getSavedJobs(@CurrentUser() user: User, @Query() pagination: PaginationDto) {
    return this.jobsService.getSavedJobs(user.id, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job detail' })
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Post(':id/save')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Save/Bookmark a job' })
  async saveJob(@CurrentUser() user: User, @Param('id') id: string) {
    return this.jobsService.saveJob(user.id, id);
  }

  @Delete(':id/save')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unsave/Remove bookmark from job' })
  async unsaveJob(@CurrentUser() user: User, @Param('id') id: string) {
    return this.jobsService.unsaveJob(user.id, id);
  }
}
