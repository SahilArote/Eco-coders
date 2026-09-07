import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Roles(Role.ADMIN)
  @Get('overview')
  @ApiOperation({ summary: 'Get platform-wide operational KPIs and disbursement metrics (Admin only)' })
  @ApiResponse({ status: 200, description: 'System overview metrics' })
  async getOverview() {
    return this.analyticsService.getSystemOverview();
  }

  @Roles(Role.ADMIN, Role.CENTER_OPERATOR)
  @Get('center/:centerId')
  @ApiOperation({ summary: 'Get procurement center operational metrics' })
  async getCenterAnalytics(@Param('centerId') centerId: string) {
    return this.analyticsService.getCenterAnalytics(centerId);
  }
}
