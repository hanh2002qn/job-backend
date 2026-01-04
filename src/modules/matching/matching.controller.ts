import { Controller, Get, UseGuards, Request } from '@nestjs/common';
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
}
