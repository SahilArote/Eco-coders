import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProcurementStateMachineService } from './procurement-state-machine.service';
import { QualityCheckDto } from './dto/quality-check.dto';
import { WeighmentDto, RejectProcurementDto } from './dto/weighment.dto';
import { ErrorCode } from '../common/constants/error-codes';
import { ProcurementStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class ProcurementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stateMachine: ProcurementStateMachineService,
  ) {}

  async getProcurementById(id: string) {
    const procurement = await this.prisma.procurement.findUnique({
      where: { id },
      include: {
        booking: { include: { crop: true, center: true, slot: true } },
        farmer: true,
        qualityCheck: { include: { inspector: { select: { phone: true, email: true } } } },
        weighment: { include: { operator: { select: { phone: true, email: true } } } },
        payment: true,
      },
    });

    if (!procurement) {
      throw new NotFoundException({
        code: ErrorCode.PROCUREMENT_NOT_FOUND,
        message: `Procurement record ${id} not found.`,
      });
    }

    return procurement;
  }

  async recordQualityCheck(
    procurementId: string,
    inspectorUserId: string,
    dto: QualityCheckDto,
  ) {
    const procurement = await this.prisma.procurement.findUnique({
      where: { id: procurementId },
      include: { booking: { include: { farmer: true } } },
    });

    if (!procurement) {
      throw new NotFoundException({
        code: ErrorCode.PROCUREMENT_NOT_FOUND,
        message: `Procurement ${procurementId} not found.`,
      });
    }

    // Must be in PROCESSING or QUALITY_CHECK
    this.stateMachine.validateTransition(procurement.status, ProcurementStatus.QUALITY_CHECK);

    const isPassed = dto.qualityStatus === 'PASSED';
    const nextStatus = isPassed ? ProcurementStatus.QUALITY_CHECK : ProcurementStatus.REJECTED;

    return this.prisma.$transaction(async (tx) => {
      const qc = await tx.qualityCheck.upsert({
        where: { procurementId },
        create: {
          procurementId,
          moisturePercentage: dto.moisturePercentage,
          moistureStandardMax: dto.moistureStandardMax || 12.0,
          foreignMatterPercentage: dto.foreignMatterPercentage || 0.0,
          qualityGrade: dto.qualityGrade,
          qualityStatus: dto.qualityStatus,
          remarks: dto.remarks,
          checkedById: inspectorUserId,
        },
        update: {
          moisturePercentage: dto.moisturePercentage,
          qualityGrade: dto.qualityGrade,
          qualityStatus: dto.qualityStatus,
          remarks: dto.remarks,
          checkedById: inspectorUserId,
        },
      });

      await tx.procurement.update({
        where: { id: procurementId },
        data: {
          status: nextStatus,
          ...(dto.qualityStatus === 'FAILED' && {
            rejectionReason: dto.remarks || 'Quality criteria not met.',
          }),
        },
      });

      await tx.booking.update({
        where: { id: procurement.bookingId },
        data: { status: nextStatus },
      });

      await tx.notification.create({
        data: {
          userId: procurement.booking.farmer.userId,
          type: 'STATUS_CHANGE',
          title: `Quality Inspection: ${dto.qualityStatus}`,
          message: isPassed
            ? `Produce passed with Grade: ${dto.qualityGrade}. Moisture: ${dto.moisturePercentage}%. Proceed to weighbridge.`
            : `Produce rejected: ${dto.remarks || 'Moisture/Grade standard not met.'}`,
          channel: 'IN_APP',
        },
      });

      return qc;
    });
  }

  async recordWeighment(
    procurementId: string,
    operatorUserId: string,
    dto: WeighmentDto,
  ) {
    const procurement = await this.prisma.procurement.findUnique({
      where: { id: procurementId },
      include: { booking: { include: { crop: true, farmer: true } } },
    });

    if (!procurement) {
      throw new NotFoundException({
        code: ErrorCode.PROCUREMENT_NOT_FOUND,
        message: 'Procurement record not found.',
      });
    }

    if (dto.grossWeightKg <= dto.tareWeightKg) {
      throw new BadRequestException({
        code: ErrorCode.WEIGHMENT_INVALID_WEIGHT,
        message: 'Gross weight must be strictly greater than Tare weight.',
      });
    }

    // Authoritative server-side weight calculation
    const netWeightKg = Math.round((dto.grossWeightKg - dto.tareWeightKg) * 100) / 100;
    const netQuintals = Math.round((netWeightKg / 100) * 100) / 100;

    this.stateMachine.validateTransition(procurement.status, ProcurementStatus.WEIGHMENT);

    return this.prisma.$transaction(async (tx) => {
      const weighment = await tx.weighment.upsert({
        where: { procurementId },
        create: {
          procurementId,
          grossWeightKg: dto.grossWeightKg,
          tareWeightKg: dto.tareWeightKg,
          netWeightKg,
          netQuintals,
          weighbridgeId: dto.weighbridgeId || 'WB-01',
          weighedById: operatorUserId,
        },
        update: {
          grossWeightKg: dto.grossWeightKg,
          tareWeightKg: dto.tareWeightKg,
          netWeightKg,
          netQuintals,
          weighedById: operatorUserId,
        },
      });

      await tx.procurement.update({
        where: { id: procurementId },
        data: {
          status: ProcurementStatus.WEIGHMENT,
          acceptedQuantity: netQuintals,
        },
      });

      await tx.booking.update({
        where: { id: procurement.bookingId },
        data: { status: ProcurementStatus.WEIGHMENT },
      });

      await tx.notification.create({
        data: {
          userId: procurement.booking.farmer.userId,
          type: 'STATUS_CHANGE',
          title: `Weighment Recorded: ${netQuintals} Quintals`,
          message: `Net weight: ${netWeightKg} kg (${netQuintals} Q). Gross: ${dto.grossWeightKg}kg, Tare: ${dto.tareWeightKg}kg.`,
          channel: 'IN_APP',
        },
      });

      return weighment;
    });
  }

  async acceptBatch(procurementId: string) {
    const procurement = await this.prisma.procurement.findUnique({
      where: { id: procurementId },
      include: {
        booking: { include: { crop: true, farmer: true } },
        weighment: true,
      },
    });

    if (!procurement || !procurement.weighment) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Cannot accept procurement without completed weighment record.',
      });
    }

    this.stateMachine.validateTransition(procurement.status, ProcurementStatus.ACCEPTED);

    return this.prisma.$transaction(async (tx) => {
      await tx.procurement.update({
        where: { id: procurementId },
        data: { status: ProcurementStatus.ACCEPTED },
      });

      await tx.booking.update({
        where: { id: procurement.bookingId },
        data: { status: ProcurementStatus.ACCEPTED },
      });

      return { status: ProcurementStatus.ACCEPTED, procurementId };
    });
  }

  async rejectBatch(procurementId: string, dto: RejectProcurementDto) {
    const procurement = await this.prisma.procurement.findUnique({
      where: { id: procurementId },
      include: { booking: { include: { farmer: true } } },
    });

    if (!procurement) {
      throw new NotFoundException({
        code: ErrorCode.PROCUREMENT_NOT_FOUND,
        message: 'Procurement not found.',
      });
    }

    this.stateMachine.validateTransition(procurement.status, ProcurementStatus.REJECTED);

    return this.prisma.$transaction(async (tx) => {
      await tx.procurement.update({
        where: { id: procurementId },
        data: {
          status: ProcurementStatus.REJECTED,
          rejectionReason: dto.rejectionReason,
        },
      });

      await tx.booking.update({
        where: { id: procurement.bookingId },
        data: { status: ProcurementStatus.REJECTED },
      });

      await tx.notification.create({
        data: {
          userId: procurement.booking.farmer.userId,
          type: 'STATUS_CHANGE',
          title: 'Procurement Batch Rejected',
          message: `Reason: ${dto.rejectionReason}`,
          channel: 'IN_APP',
        },
      });

      return { status: ProcurementStatus.REJECTED, reason: dto.rejectionReason };
    });
  }

  async completeProcurement(procurementId: string) {
    const procurement = await this.prisma.procurement.findUnique({
      where: { id: procurementId },
      include: {
        booking: { include: { crop: true, farmer: true } },
        weighment: true,
      },
    });

    if (!procurement || !procurement.weighment) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Cannot complete procurement without weighment slip.',
      });
    }

    this.stateMachine.validateTransition(procurement.status, ProcurementStatus.COMPLETED);

    const netQuintals = Number(procurement.weighment.netQuintals);
    const mspRate = Number(procurement.booking.crop.mspRatePerQuintal);
    const amount = Math.round(netQuintals * mspRate * 100) / 100;

    return this.prisma.$transaction(async (tx) => {
      const now = new Date();

      await tx.procurement.update({
        where: { id: procurementId },
        data: {
          status: ProcurementStatus.COMPLETED,
          completedAt: now,
        },
      });

      await tx.booking.update({
        where: { id: procurement.bookingId },
        data: {
          status: ProcurementStatus.COMPLETED,
          completedAt: now,
        },
      });

      // Automatically create Payment record
      await tx.payment.upsert({
        where: { procurementId },
        create: {
          procurementId,
          amount,
          mspRate,
          quantityQuintals: netQuintals,
          currency: 'INR',
          status: PaymentStatus.PAYMENT_PENDING,
          bankName: procurement.booking.farmer.bankName || 'State Bank of India',
          accountMasked: procurement.booking.farmer.bankAccountMasked || '•••• •••• •••• 9012',
        },
        update: {
          amount,
          quantityQuintals: netQuintals,
        },
      });

      await tx.notification.create({
        data: {
          userId: procurement.booking.farmer.userId,
          type: 'STATUS_CHANGE',
          title: 'Procurement Completed 🎉',
          message: `Your procurement for ${netQuintals} Quintals has been finalized. Payout of ₹${amount.toLocaleString('en-IN')} is pending initiation.`,
          channel: 'IN_APP',
        },
      });

      return {
        status: ProcurementStatus.COMPLETED,
        procurementId,
        payoutAmount: amount,
      };
    });
  }
}
