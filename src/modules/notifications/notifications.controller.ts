import { Controller, Get, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

interface UserRequest extends Request {
  user: {
    id: string;
  };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Request() req: UserRequest) {
    return this.notificationsService.findAllByUser(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Request() req: UserRequest, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.id, id);
  }

  @Patch('read-all')
  markAllAsRead(@Request() req: UserRequest) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  remove(@Request() req: UserRequest, @Param('id') id: string) {
    return this.notificationsService.remove(req.user.id, id);
  }
}
