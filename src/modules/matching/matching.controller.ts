import { Controller, Get, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('matching')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matching')
export class MatchingController {
    constructor(private readonly matchingService: MatchingService) { }

    @Get('jobs')
    @ApiOperation({ summary: 'Get jobs matched to user profile' })
    async getMatchedJobs(@Request() req) {
        return this.matchingService.matchJobs(req.user.id);
    }

    @Get('job/:jobId')
    @ApiOperation({ summary: 'Get detailed matching analysis for a specific job' })
    async getJobDetail(@Request() req, @Param('jobId') jobId: string) {
        return this.matchingService.matchSpecificJob(req.user.id, jobId);
    }
}
