import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
    constructor(private readonly profilesService: ProfilesService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile (skills, experience, etc.)' })
    async getMyProfile(@Request() req) {
        return this.profilesService.findByUserId(req.user.id);
    }

    @Put('me')
    @ApiOperation({ summary: 'Update current user profile' })
    async updateMyProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
        return this.profilesService.updateByUserId(req.user.id, updateProfileDto);
    }
}
