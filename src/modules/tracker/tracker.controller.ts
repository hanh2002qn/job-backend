import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TrackerService } from './tracker.service';
import { CreateTrackerDto } from './dto/create-tracker.dto';
import { UpdateTrackerDto } from './dto/update-tracker.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApplicationStatus } from './entities/job-tracker.entity';

@ApiTags('tracker')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tracker')
export class TrackerController {
    constructor(private readonly trackerService: TrackerService) { }

    @Post()
    @ApiOperation({ summary: 'Track a new job' })
    create(@Request() req, @Body() createTrackerDto: CreateTrackerDto) {
        return this.trackerService.create(req.user.id, createTrackerDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all tracked jobs with optional status filter' })
    @ApiQuery({ name: 'status', enum: ApplicationStatus, required: false })
    findAll(@Request() req, @Query('status') status?: ApplicationStatus) {
        return this.trackerService.findAll(req.user.id, { status });
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update tracker entry (status, notes, cv, etc.)' })
    update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateDto: UpdateTrackerDto,
    ) {
        return this.trackerService.update(id, req.user.id, updateDto);
    }
}
