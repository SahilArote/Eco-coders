import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async findUserNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      timestamp: n.createdAt.toISOString(),
      isRead: n.isRead,
    }));
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async clearAll(userId: string) {
    await this.prisma.notification.deleteMany({
      where: { userId },
    });
    return { cleared: true };
  }

  async createAndSend(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>,
  ) {
    // 1. Transactional storage in PostgreSQL first (Guaranteed non-blocking principle)
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        channel: 'IN_APP',
        metadata: metadata || {},
        sentAt: new Date(),
      },
    });

    // 2. Real-time broadcast to active socket room
    try {
      this.realtime.emitNotificationCreated(userId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timestamp: notification.createdAt.toISOString(),
        isRead: false,
      });
    } catch (e) {
      this.logger.warn(`Failed to push notification via WebSocket: ${e.message}`);
    }

    return notification;
  }
}
