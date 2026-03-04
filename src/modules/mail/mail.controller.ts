import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { UpdateMailPreferencesDto } from './dto/update-mail-preferences.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { EmailPreference } from './entities/email-preference.entity';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('preferences')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current email notification preferences' })
  async getPreferences(@CurrentUser() user: User): Promise<EmailPreference> {
    return this.mailService.getPreferences(user.id);
  }

  @Patch('preferences')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update email notification preferences' })
  async updatePreferences(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateMailPreferencesDto,
  ): Promise<EmailPreference> {
    return this.mailService.updatePreferences(user.id, updateDto);
  }
}
