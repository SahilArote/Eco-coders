import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ErrorCode } from '../common/constants/error-codes';
import { ProcurementStatus, SlotStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async createBooking(userId: string, dto: CreateBookingDto) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
    });

    if (!farmer) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Only registered farmers can book procurement slots.',
      });
    }

    // Check if farmer already has an active booking for this crop
    const activeBooking = await this.prisma.booking.findFirst({
      where: {
        farmerId: farmer.id,
        cropId: dto.cropId,
        status: { in: [ProcurementStatus.BOOKED, ProcurementStatus.ARRIVED, ProcurementStatus.WAITING, ProcurementStatus.PROCESSING] },
      },
    });

    if (activeBooking) {
      throw new ConflictException({
        code: ErrorCode.BOOKING_ALREADY_ACTIVE,
        message: 'You already hold an active booking for this crop. Please complete or cancel your existing booking first.',
      });
    }

    const center = await this.prisma.procurementCenter.findUnique({
      where: { id: dto.centerId },
    });
    if (!center) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Selected procurement center not found.',
      });
    }

    const crop = await this.prisma.crop.findUnique({
      where: { id: dto.cropId },
    });
    if (!crop) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Selected crop not found.',
      });
    }

    // Execute atomic reservation within a row-locked transaction
    return this.prisma.$transaction(async (tx) => {
      // PostgreSQL row lock on slot
      const lockedSlots = await tx.$queryRaw<
        Array<{
          id: string;
          capacity: number;
          booked_count: number;
          status: string;
          slot_date: Date;
          start_time: string;
          end_time: string;
        }>
      >`
        SELECT id, capacity, booked_count, status, slot_date, start_time, end_time
        FROM slots
        WHERE id = ${dto.slotId}::uuid
        FOR UPDATE
      `;

      if (!lockedSlots || lockedSlots.length === 0) {
        throw new NotFoundException({
          code: ErrorCode.SLOT_NOT_FOUND,
          message: 'Selected time slot does not exist.',
        });
      }

      const slot = lockedSlots[0];

      if (slot.booked_count >= slot.capacity) {
        throw new ConflictException({
          code: ErrorCode.BOOKING_SLOT_FULL,
          message: 'The selected slot is no longer available.',
          details: { capacity: slot.capacity, bookedCount: slot.booked_count },
        });
      }

      // Generate daily sequence token number (e.g. A105)
      const todayCount = await tx.booking.count({
        where: {
          centerId: dto.centerId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      const tokenNumber = `A${String(101 + todayCount).padStart(3, '0')}`;

      const qrPayload = `AGRI-PROC-TOKEN|${tokenNumber}|${center.code}|${crop.code}|${dto.quantityQuintals}Q|${farmer.fullName}`;

      // Create Booking record
      const booking = await tx.booking.create({
        data: {
          farmerId: farmer.id,
          slotId: dto.slotId,
          centerId: dto.centerId,
          cropId: dto.cropId,
          estimatedQuantityQuintals: dto.quantityQuintals,
          vehicleType: dto.vehicleType || 'tractor',
          tokenNumber,
          status: ProcurementStatus.BOOKED,
          qrPayload,
        },
      });

      // Create 1:1 Procurement tracking record
      await tx.procurement.create({
        data: {
          bookingId: booking.id,
          farmerId: farmer.id,
          centerId: dto.centerId,
          status: ProcurementStatus.BOOKED,
        },
      });

      // Increment slot booked count
      const newBookedCount = slot.booked_count + 1;
      const newStatus = newBookedCount >= slot.capacity ? SlotStatus.FULL : SlotStatus.AVAILABLE;

      await tx.slot.update({
        where: { id: dto.slotId },
        data: {
          bookedCount: newBookedCount,
          status: newStatus,
        },
      });

      // Insert Initial Notification for Farmer
      await tx.notification.create({
        data: {
          userId,
          type: 'REMINDER',
          title: `Slot Booked: Token ${tokenNumber}`,
          message: `${crop.name} at ${center.name} (${slot.start_time} - ${slot.end_time}).`,
          channel: 'IN_APP',
        },
      });

      const slotDateStr = slot.slot_date instanceof Date ? slot.slot_date.toISOString().split('T')[0] : String(slot.slot_date);

      return {
        id: booking.id,
        tokenNumber: booking.tokenNumber,
        farmerId: farmer.id,
        centerId: center.id,
        centerName: center.name,
        cropId: crop.id,
        cropName: crop.name,
        slotId: slot.id,
        slotDate: slotDateStr,
        slotTimeRange: `${slot.start_time} - ${slot.end_time}`,
        estimatedQuantityQuintals: Number(booking.estimatedQuantityQuintals),
        vehicleType: booking.vehicleType,
        status: booking.status,
        createdAt: booking.createdAt.toISOString(),
        qrPayload: booking.qrPayload,
      };
    });
  }

  async findActiveBookingForFarmer(userId: string) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
    });

    if (!farmer) return null;

    const booking = await this.prisma.booking.findFirst({
      where: {
        farmerId: farmer.id,
        status: { notIn: [ProcurementStatus.CANCELLED] },
      },
      include: {
        center: true,
        crop: true,
        slot: true,
        procurement: {
          include: {
            qualityCheck: true,
            weighment: true,
            payment: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!booking) return null;

    return this.formatBookingResponse(booking);
  }

  async findBookingById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        center: true,
        crop: true,
        slot: true,
        procurement: {
          include: {
            qualityCheck: true,
            weighment: true,
            payment: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException({
        code: ErrorCode.BOOKING_NOT_FOUND,
        message: `Booking ${id} not found`,
      });
    }

    return this.formatBookingResponse(booking);
  }

  async cancelBooking(userId: string, bookingId: string) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
    });

    if (!farmer) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Farmer not found',
      });
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.farmerId !== farmer.id) {
      throw new NotFoundException({
        code: ErrorCode.BOOKING_NOT_FOUND,
        message: 'Booking not found or not owned by user.',
      });
    }

    if (booking.status !== ProcurementStatus.BOOKED) {
      throw new BadRequestException({
        code: ErrorCode.PROCUREMENT_INVALID_TRANSITION,
        message: 'Only bookings in BOOKED state can be cancelled.',
      });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: ProcurementStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      await tx.procurement.update({
        where: { bookingId },
        data: { status: ProcurementStatus.CANCELLED },
      });

      await tx.slot.update({
        where: { id: booking.slotId },
        data: {
          bookedCount: { decrement: 1 },
          status: SlotStatus.AVAILABLE,
        },
      });

      return { cancelled: true, bookingId };
    });
  }

  private formatBookingResponse(booking: any) {
    const p = booking.procurement;
    const q = p?.qualityCheck;
    const w = p?.weighment;
    const pay = p?.payment;

    return {
      id: booking.id,
      tokenNumber: booking.tokenNumber,
      farmerId: booking.farmerId,
      centerId: booking.centerId,
      centerName: booking.center.name,
      cropId: booking.cropId,
      cropName: booking.crop.name,
      slotId: booking.slotId,
      slotDate: booking.slot.slotDate.toISOString().split('T')[0],
      slotTimeRange: `${booking.slot.startTime} - ${booking.slot.endTime}`,
      estimatedQuantityQuintals: Number(booking.estimatedQuantityQuintals),
      vehicleType: booking.vehicleType,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      qrPayload: booking.qrPayload,
      qualityReport: q
        ? {
            id: q.id,
            moisturePercentage: Number(q.moisturePercentage),
            moistureStandardMax: Number(q.moistureStandardMax),
            foreignMatterPercentage: Number(q.foreignMatterPercentage),
            qualityGrade: q.qualityGrade,
            qualityStatus: q.qualityStatus,
            checkedAt: q.checkedAt.toISOString(),
            remarks: q.remarks || '',
          }
        : undefined,
      weighmentSlip: w
        ? {
            id: w.id,
            grossWeightKg: Number(w.grossWeightKg),
            tareWeightKg: Number(w.tareWeightKg),
            netWeightKg: Number(w.netWeightKg),
            netQuintals: Number(w.netQuintals),
            weighedAt: w.weighedAt.toISOString(),
            weighbridgeId: w.weighbridgeId || 'WB-01',
          }
        : undefined,
      paymentDetails: pay
        ? {
            id: pay.id,
            netAmount: Number(pay.amount),
            mspRate: Number(pay.mspRate),
            quantityQuintals: Number(pay.quantityQuintals),
            currency: pay.currency,
            status: pay.status.replace('PAYMENT_', ''),
            bankName: pay.bankName,
            accountMasked: pay.accountMasked,
            dbtReferenceNumber: pay.dbtReferenceNumber,
            initiatedAt: pay.initiatedAt?.toISOString(),
            completedAt: pay.completedAt?.toISOString(),
          }
        : undefined,
    };
  }
}
