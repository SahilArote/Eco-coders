import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Roles(Role.FARMER)
  @Post()
  @ApiOperation({ summary: 'Create concurrency-safe slot booking and generate token' })
  @ApiResponse({ status: 201, description: 'Booking created' })
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(user.userId, dto);
  }

  @Roles(Role.FARMER)
  @Get('active')
  @ApiOperation({ summary: 'Get current active booking pass for authenticated farmer' })
  @ApiResponse({ status: 200, description: 'Active booking' })
  async getActiveBooking(@CurrentUser() user: RequestUser) {
    return this.bookingsService.findActiveBookingForFarmer(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking pass by ID with full lifecycle report' })
  @ApiResponse({ status: 200, description: 'Booking pass' })
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findBookingById(id);
  }

  @Roles(Role.FARMER)
  @Delete(':id')
  @ApiOperation({ summary: 'Cancel an active booking prior to arrival' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  async cancel(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.bookingsService.cancelBooking(user.userId, id);
  }
}
