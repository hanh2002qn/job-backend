import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JobSearchDto } from './dto/job-search.dto';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search jobs' })
  async search(@Query() query: JobSearchDto) {
    return this.jobsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job detail' })
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }
}
