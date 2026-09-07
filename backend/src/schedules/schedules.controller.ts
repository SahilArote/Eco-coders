import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Procurement Schedules')
@Controller()
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Public()
  @Get('centers/:centerId/schedules')
  @ApiOperation({ summary: 'List procurement schedules for a center' })
  @ApiResponse({ status: 200, description: 'List of schedules' })
  async findByCenter(@Param('centerId') centerId: string) {
    return this.schedulesService.findByCenter(centerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Post('admin/schedules')
  @ApiOperation({ summary: 'Create new procurement schedule (Admin only)' })
  @ApiResponse({ status: 201, description: 'Schedule created' })
  async create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }
}
