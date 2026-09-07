import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { ErrorCode } from '../common/constants/error-codes';
import { PaymentStatus, ProcurementStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPaymentByProcurementId(procurementId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { procurementId },
      include: {
        procurement: {
          include: {
            farmer: true,
            booking: { include: { crop: true, center: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Payment record not found for this procurement.',
      });
    }

    return {
      id: payment.id,
      procurementId: payment.procurementId,
      amount: Number(payment.amount),
      mspRate: Number(payment.mspRate),
      quantityQuintals: Number(payment.quantityQuintals),
      currency: payment.currency,
      status: payment.status,
      dbtReferenceNumber: payment.dbtReferenceNumber,
      bankName: payment.bankName,
      accountMasked: payment.accountMasked,
      initiatedAt: payment.initiatedAt?.toISOString(),
      completedAt: payment.completedAt?.toISOString(),
      farmerName: payment.procurement.farmer.fullName,
      cropName: payment.procurement.booking.crop.name,
      centerName: payment.procurement.booking.center.name,
    };
  }

  async updatePaymentStatus(paymentId: string, dto: UpdatePaymentStatusDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        procurement: {
          include: {
            farmer: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: `Payment ${paymentId} not found.`,
      });
    }

    const now = new Date();
    const dbtRef =
      dto.dbtReferenceNumber ||
      payment.dbtReferenceNumber ||
      `DBT-IN-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`;

    const isCompleted = dto.status === PaymentStatus.PAYMENT_COMPLETED;
    const isProcessing = dto.status === PaymentStatus.PAYMENT_PROCESSING;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: dto.status,
          dbtReferenceNumber: dbtRef,
          ...(isProcessing && !payment.initiatedAt && { initiatedAt: now }),
          ...(isCompleted && { completedAt: now }),
        },
      });

      // Synchronize procurement and booking status
      const procStatus = isCompleted
        ? ProcurementStatus.PAYMENT_COMPLETED
        : ProcurementStatus.PAYMENT_PROCESSING;

      await tx.procurement.update({
        where: { id: payment.procurementId },
        data: { status: procStatus },
      });

      await tx.booking.update({
        where: { id: payment.procurement.bookingId },
        data: { status: procStatus },
      });

      // Notification
      const title = isCompleted ? 'DBT Payment Completed ✅' : 'DBT Payment Processing ⏳';
      const message = isCompleted
        ? `Payment of ₹${Number(payment.amount).toLocaleString('en-IN')} credited to ${payment.bankName} (${payment.accountMasked}). Ref: ${dbtRef}`
        : `Payment of ₹${Number(payment.amount).toLocaleString('en-IN')} is initiated via DBT. Ref: ${dbtRef}`;

      await tx.notification.create({
        data: {
          userId: payment.procurement.farmer.userId,
          type: 'PAYMENT',
          title,
          message,
          channel: 'IN_APP',
        },
      });

      return updated;
    });
  }
}
