import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrackerService } from './tracker.service';
import { CreateTrackerDto } from './dto/create-tracker.dto';
import { UpdateTrackerStatusDto } from './dto/update-tracker-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

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
    @ApiOperation({ summary: 'Get all tracked jobs' })
    findAll(@Request() req) {
        return this.trackerService.findAll(req.user.id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update application status' })
    updateStatus(
        @Request() req,
        @Param('id') id: string,
        @Body() updateDto: UpdateTrackerStatusDto,
    ) {
        return this.trackerService.updateStatus(id, req.user.id, updateDto.status);
    }
}
