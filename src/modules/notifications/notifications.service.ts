import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(private readonly notificationsRepository: NotificationRepository) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create(dto);
    return this.notificationsRepository.save(notification);
  }

  async findAllByUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50, // Limit to last 50 notifications
    });
  }

  async markAsRead(userId: string, id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.read = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update({ userId, read: false }, { read: true });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.notificationsRepository.delete({ id, userId });
  }

  async sendPushNotification(
    userId: string,
    title: string,
    message: string,
    link?: string,
  ): Promise<void> {
    // TODO: Integrate with FCM or OneSignal
    const notification = this.notificationsRepository.create({
      userId,
      title,
      message,
      link,
      type: NotificationType.INFO,
    });
    await this.notificationsRepository.save(notification);

    this.logger.log(`[PUSH NOTIFICATION MOCK] To User: ${userId}, Title: ${title}`);
  }
}
