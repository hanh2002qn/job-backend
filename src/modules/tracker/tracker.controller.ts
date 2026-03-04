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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { TrackerService } from './tracker.service';
import { CreateTrackerDto } from './dto/create-tracker.dto';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateTrackerDto } from './dto/update-tracker.dto';
import { BulkUpdateStatusDto } from './dto/bulk-update-status.dto';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiFeatureGuard } from '../../common/guards/ai-feature.guard';
import { AiFeature } from '../../common/decorators/ai-feature.decorator';
import { JobTracker, ApplicationStatus } from './entities/job-tracker.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { InterviewSchedule } from './entities/interview-schedule.entity';
import { TrackerNote } from './entities/tracker-note.entity';

@ApiTags('tracker')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tracker')
export class TrackerController {
  constructor(private readonly trackerService: TrackerService) {}

  @Post()
  @ApiOperation({ summary: 'Track a new job' })
  @ApiResponse({ status: 201, description: 'Job tracker created.', type: JobTracker })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(
    @CurrentUser() user: User,
    @Body() createTrackerDto: CreateTrackerDto,
  ): Promise<JobTracker> {
    return this.trackerService.create(user.id, createTrackerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tracked jobs with filtering and sorting' })
  @ApiResponse({ status: 200, description: 'List of tracked jobs.', type: [JobTracker] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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
  ): Promise<JobTracker[]> {
    return this.trackerService.findAll(user.id, {
      status,
      company,
      title,
      sortBy,
      order,
    });
  }

  @Get('interviews/calendar')
  @ApiOperation({ summary: 'Get all scheduled interviews' })
  @ApiResponse({
    status: 200,
    description: 'Interview calendar returned.',
    type: [InterviewSchedule],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getCalendar(@CurrentUser() user: User): Promise<InterviewSchedule[]> {
    return this.trackerService.findAllInterviews(user.id);
  }

  @Get('interviews/:id/prep-tips')
  @UseGuards(AiFeatureGuard)
  @AiFeature('interview_prep')
  @ApiOperation({ summary: 'Get AI preparation tips for an interview' })
  @ApiParam({ name: 'id', description: 'Interview ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Interview preparation tips returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getPrepTips(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<Record<string, unknown>> {
    return this.trackerService.getInterviewPrepTips(user.id, id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get application statistics' })
  @ApiResponse({ status: 200, description: 'Application statistics returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getStats(@CurrentUser() user: User): Promise<Record<string, number>> {
    return this.trackerService.getStats(user.id);
  }

  @Post(':id/interviews')
  @ApiOperation({ summary: 'Schedule an interview for a tracked job' })
  @ApiParam({ name: 'id', description: 'Tracker ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Interview scheduled.', type: InterviewSchedule })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  addInterview(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateInterviewDto,
  ): Promise<InterviewSchedule> {
    return this.trackerService.addInterview(user.id, id, dto);
  }

  @Post('bulk-status')
  @ApiOperation({ summary: 'Bulk update status for multiply trackers' })
  @ApiResponse({ status: 201, description: 'Status updated for specified trackers.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  bulkUpdateStatus(
    @CurrentUser() user: User,
    @Body() dto: BulkUpdateStatusDto,
  ): Promise<{ updated: number }> {
    return this.trackerService.bulkUpdateStatus(user.id, dto);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add a note to a tracker' })
  @ApiParam({ name: 'id', description: 'Tracker ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Note added.', type: TrackerNote })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  addNote(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateNoteDto,
  ): Promise<TrackerNote> {
    return this.trackerService.addNote(user.id, id, dto.content);
  }

  @Get(':id/notes')
  @ApiOperation({ summary: 'Get all notes for a tracker' })
  @ApiParam({ name: 'id', description: 'Tracker ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Notes returned.', type: [TrackerNote] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getNotes(@CurrentUser() user: User, @Param('id') id: string): Promise<TrackerNote[]> {
    return this.trackerService.getTrackerNotes(user.id, id);
  }

  @Patch('notes/:noteId')
  @ApiOperation({ summary: 'Update a note' })
  @ApiParam({ name: 'noteId', description: 'Note ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Note updated.', type: TrackerNote })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  updateNote(
    @CurrentUser() user: User,
    @Param('noteId') noteId: string,
    @Body() dto: UpdateNoteDto,
  ): Promise<TrackerNote> {
    return this.trackerService.updateNote(user.id, noteId, dto.content);
  }

  @Delete('notes/:noteId')
  @ApiOperation({ summary: 'Delete a note' })
  @ApiParam({ name: 'noteId', description: 'Note ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Note deleted.', type: TrackerNote })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  deleteNote(@CurrentUser() user: User, @Param('noteId') noteId: string): Promise<TrackerNote> {
    return this.trackerService.deleteNote(user.id, noteId);
  }

  /*
  @Post('interviews/:id/sync-calendar')
  @ApiOperation({ summary: 'Sync interview to Google Calendar' })
  async syncCalendar(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body('accessToken') accessToken: string,
  ) {
    if (!accessToken) {
      // TODO: Ideally we should get this from stored tokens, but simplified here to accept from client
      // or implement server-side token storage for Google OAuth
      throw new Error('Google User Access Token is required for calendar sync');
    }
    return this.trackerService.syncInterviewToCalendar(user.id, id, accessToken);
  }
  */

  @Patch(':id')
  @ApiOperation({ summary: 'Update tracker entry (status, notes, cv, etc.)' })
  @ApiParam({ name: 'id', description: 'Tracker ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Tracker updated.', type: JobTracker })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: UpdateTrackerDto,
  ): Promise<JobTracker> {
    return this.trackerService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a job from tracking list' })
  @ApiParam({ name: 'id', description: 'Tracker ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Tracker removed.', type: JobTracker })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  remove(@CurrentUser() user: User, @Param('id') id: string): Promise<JobTracker> {
    return this.trackerService.remove(id, user.id);
  }
}
