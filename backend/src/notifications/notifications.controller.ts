import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get in-app notifications for authenticated user' })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  async findMine(@CurrentUser() user: RequestUser) {
    return this.notificationsService.findUserNotifications(user.userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Delete('clear-all')
  @ApiOperation({ summary: 'Clear all notifications for authenticated user' })
  async clearAll(@CurrentUser() user: RequestUser) {
    return this.notificationsService.clearAll(user.userId);
  }
}
