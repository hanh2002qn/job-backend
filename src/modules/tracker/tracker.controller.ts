import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TrackerService } from './tracker.service';
import { CreateTrackerDto } from './dto/create-tracker.dto';
import { UpdateTrackerDto } from './dto/update-tracker.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApplicationStatus } from './entities/job-tracker.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('tracker')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tracker')
export class TrackerController {
  constructor(private readonly trackerService: TrackerService) {}

  @Post()
  @ApiOperation({ summary: 'Track a new job' })
  create(@CurrentUser() user: User, @Body() createTrackerDto: CreateTrackerDto) {
    return this.trackerService.create(user.id, createTrackerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tracked jobs with filtering and sorting' })
  @ApiQuery({ name: 'status', enum: ApplicationStatus, required: false })
  @ApiQuery({ name: 'company', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'sortBy', required: false, example: 'updatedAt' })
  @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false })
  findAll(
    @CurrentUser() user: User,
    @Query('status') status?: ApplicationStatus,
    @Query('company') company?: string,
    @Query('title') title?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    return this.trackerService.findAll(user.id, {
      status,
      company,
      title,
      sortBy,
      order,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get application statistics' })
  getStats(@CurrentUser() user: User) {
    return this.trackerService.getStats(user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tracker entry (status, notes, cv, etc.)' })
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() updateDto: UpdateTrackerDto) {
    return this.trackerService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a job from tracking list' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.trackerService.remove(id, user.id);
  }
}
