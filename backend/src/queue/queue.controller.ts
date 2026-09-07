import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CenterScopeGuard } from '../common/guards/center-scope.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Queue Operations')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Public()
  @Get('center/:centerId')
  @ApiOperation({ summary: 'Get live queue state for a procurement center' })
  @ApiResponse({ status: 200, description: 'Center queue state' })
  async getCenterQueue(@Param('centerId') centerId: string) {
    return this.queueService.getQueueStateForCenter(centerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FARMER)
  @ApiBearerAuth()
  @Get('booking/:bookingId/position')
  @ApiOperation({ summary: 'Get real-time queue position and ETA for a specific booking' })
  async getFarmerQueuePosition(@Param('bookingId') bookingId: string) {
    return this.queueService.getFarmerQueuePosition(bookingId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, CenterScopeGuard)
  @Roles(Role.CENTER_OPERATOR, Role.ADMIN)
  @ApiBearerAuth()
  @Post('center/:centerId/arrive')
  @ApiOperation({ summary: 'Mark farmer arrival by booking ID (Operator only)' })
  async markArrival(
    @Param('centerId') centerId: string,
    @Body('bookingId') bookingId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.queueService.markArrival(bookingId, user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CENTER_OPERATOR, Role.ADMIN)
  @ApiBearerAuth()
  @Post('scan-qr')
  @ApiOperation({ summary: 'Scan farmer QR pass and check-in (Operator only)' })
  async scanQr(
    @Body('qrPayload') qrPayload: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.queueService.scanQrAndArrive(qrPayload, user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, CenterScopeGuard)
  @Roles(Role.CENTER_OPERATOR, Role.ADMIN)
  @ApiBearerAuth()
  @Post('center/:centerId/call-next')
  @ApiOperation({ summary: 'Call next waiting token to counter (Operator only)' })
  @ApiQuery({ name: 'counterNumber', required: false, type: Number })
  async callNextToken(
    @Param('centerId') centerId: string,
    @Query('counterNumber') counterNumber?: number,
    @CurrentUser() user?: RequestUser,
  ) {
    return this.queueService.callNextToken(centerId, Number(counterNumber) || 1, user?.userId);
  }
}
