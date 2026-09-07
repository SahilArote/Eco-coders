import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SlotsService } from './slots.service';
import { GenerateSlotsDto } from './dto/generate-slots.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Slots')
@Controller()
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Public()
  @Get('centers/:centerId/slots')
  @ApiOperation({ summary: 'Get real-time slot availability for a center & crop' })
  @ApiQuery({ name: 'cropId', required: false })
  @ApiQuery({ name: 'date', required: false, example: '2026-09-06' })
  async findAvailableSlots(
    @Param('centerId') centerId: string,
    @Query('cropId') cropId?: string,
    @Query('date') date?: string,
  ) {
    return this.slotsService.findAvailableSlots(centerId, cropId, date);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Post('admin/slots/generate')
  @ApiOperation({ summary: 'Generate time slots for a schedule (Admin only)' })
  @ApiResponse({ status: 201, description: 'Slots generated' })
  async generateDailySlots(@Body() dto: GenerateSlotsDto) {
    return this.slotsService.generateDailySlots(dto);
  }
}
