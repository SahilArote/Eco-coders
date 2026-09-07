import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProcurementService } from './procurement.service';
import { QualityCheckDto } from './dto/quality-check.dto';
import { WeighmentDto, RejectProcurementDto } from './dto/weighment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Procurement Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('procurements')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get procurement record details with quality, weighment, and payment' })
  @ApiResponse({ status: 200, description: 'Procurement details' })
  async getById(@Param('id') id: string) {
    return this.procurementService.getProcurementById(id);
  }

  @Roles(Role.CENTER_OPERATOR, Role.ADMIN)
  @Post(':id/quality')
  @ApiOperation({ summary: 'Record quality inspection results (Operator only)' })
  async recordQuality(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: QualityCheckDto,
  ) {
    return this.procurementService.recordQualityCheck(id, user.userId, dto);
  }

  @Roles(Role.CENTER_OPERATOR, Role.ADMIN)
  @Post(':id/weighment')
  @ApiOperation({ summary: 'Record weighbridge weights with auto net weight recalculation (Operator only)' })
  async recordWeighment(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: WeighmentDto,
  ) {
    return this.procurementService.recordWeighment(id, user.userId, dto);
  }

  @Roles(Role.CENTER_OPERATOR, Role.ADMIN)
  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept procurement batch after weighment (Operator only)' })
  async acceptBatch(@Param('id') id: string) {
    return this.procurementService.acceptBatch(id);
  }

  @Roles(Role.CENTER_OPERATOR, Role.ADMIN)
  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject procurement batch during quality check (Operator only)' })
  async rejectBatch(
    @Param('id') id: string,
    @Body() dto: RejectProcurementDto,
  ) {
    return this.procurementService.rejectBatch(id, dto);
  }

  @Roles(Role.CENTER_OPERATOR, Role.ADMIN)
  @Post(':id/complete')
  @ApiOperation({ summary: 'Finalize procurement and initiate payment record (Operator only)' })
  async complete(@Param('id') id: string) {
    return this.procurementService.completeProcurement(id);
  }
}
