import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to WebSocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from WebSocket: ${client.id}`);
  }

  @SubscribeMessage('join_center')
  handleJoinCenter(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { centerId: string },
  ) {
    if (data?.centerId) {
      const room = `center:${data.centerId}`;
      client.join(room);
      this.logger.log(`Client ${client.id} joined ${room}`);
      return { event: 'joined', room };
    }
  }

  @SubscribeMessage('join_booking')
  handleJoinBooking(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string },
  ) {
    if (data?.bookingId) {
      const room = `booking:${data.bookingId}`;
      client.join(room);
      this.logger.log(`Client ${client.id} joined ${room}`);
      return { event: 'joined', room };
    }
  }

  @SubscribeMessage('join_user')
  handleJoinUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (data?.userId) {
      const room = `user:${data.userId}`;
      client.join(room);
      this.logger.log(`Client ${client.id} joined ${room}`);
      return { event: 'joined', room };
    }
  }

  // Broadcasters used by domain services
  emitQueueUpdated(centerId: string, payload: any) {
    this.server?.to(`center:${centerId}`).emit('QUEUE_UPDATED', payload);
  }

  emitTokenCalled(centerId: string, payload: any) {
    this.server?.to(`center:${centerId}`).emit('TOKEN_CALLED', payload);
  }

  emitProcurementUpdated(bookingId: string, payload: any) {
    this.server?.to(`booking:${bookingId}`).emit('PROCUREMENT_STATUS_CHANGED', payload);
  }

  emitPaymentUpdated(bookingId: string, payload: any) {
    this.server?.to(`booking:${bookingId}`).emit('PAYMENT_UPDATED', payload);
  }

  emitNotificationCreated(userId: string, payload: any) {
    this.server?.to(`user:${userId}`).emit('NOTIFICATION_CREATED', payload);
  }
}
