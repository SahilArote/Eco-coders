import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OperatorsService } from './operators.service';
import { AssignOperatorDto } from './dto/assign-operator.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CenterScopeGuard } from '../common/guards/center-scope.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Operators & Day-of-Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('operator')
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  @Roles(Role.ADMIN)
  @Post('assign')
  @ApiOperation({ summary: 'Assign an operator to a procurement center (Admin only)' })
  @ApiResponse({ status: 200, description: 'Operator assigned' })
  async assign(@Body() dto: AssignOperatorDto) {
    return this.operatorsService.assignOperator(dto);
  }

  @Roles(Role.ADMIN, Role.CENTER_OPERATOR)
  @Get('center/:centerId')
  @ApiOperation({ summary: 'List operators for a procurement center' })
  async getCenterOperators(@Param('centerId') centerId: string) {
    return this.operatorsService.getCenterOperators(centerId);
  }

  @Roles(Role.CENTER_OPERATOR, Role.ADMIN)
  @UseGuards(CenterScopeGuard)
  @Get('dashboard/:centerId')
  @ApiOperation({ summary: 'Get day-of-operations summary metrics for operator center' })
  async getOperatorDashboard(
    @Param('centerId') centerId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.operatorsService.getDashboardSummary(centerId);
  }
}
