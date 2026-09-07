import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('procurement/:procurementId')
  @ApiOperation({ summary: 'Get payment status & DBT details for a procurement record' })
  @ApiResponse({ status: 200, description: 'Payment details' })
  async getPayment(@Param('procurementId') procurementId: string) {
    return this.paymentsService.getPaymentByProcurementId(procurementId);
  }

  @Roles(Role.CENTER_OPERATOR, Role.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update payment status simulation (Operator / Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment status updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.paymentsService.updatePaymentStatus(id, dto);
  }
}
