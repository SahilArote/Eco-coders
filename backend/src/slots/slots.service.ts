import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateSlotsDto } from './dto/generate-slots.dto';
import { ErrorCode } from '../common/constants/error-codes';
import { SlotStatus } from '@prisma/client';

@Injectable()
export class SlotsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAvailableSlots(centerId: string, cropId?: string, dateStr?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date();

    const slots = await this.prisma.slot.findMany({
      where: {
        schedule: {
          centerId,
          ...(cropId && { cropId }),
          status: 'ACTIVE',
        },
        slotDate: targetDate,
      },
      include: {
        schedule: {
          include: { crop: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return slots.map((slot) => {
      const remaining = slot.capacity - slot.bookedCount;
      let status: 'AVAILABLE' | 'FEW_LEFT' | 'FULL' = 'AVAILABLE';
      if (remaining <= 0) {
        status = 'FULL';
      } else if (remaining <= 5) {
        status = 'FEW_LEFT';
      }

      return {
        id: slot.id,
        centerId,
        scheduleId: slot.scheduleId,
        cropId: slot.schedule.cropId,
        cropName: slot.schedule.crop.name,
        slotDate: slot.slotDate.toISOString().split('T')[0],
        startTime: slot.startTime,
        endTime: slot.endTime,
        capacity: slot.capacity,
        bookedCount: slot.bookedCount,
        availableCount: Math.max(0, remaining),
        status,
      };
    });
  }

  async generateDailySlots(dto: GenerateSlotsDto) {
    const schedule = await this.prisma.procurementSchedule.findUnique({
      where: { id: dto.scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: `Schedule ${dto.scheduleId} not found`,
      });
    }

    const defaultWindows = [
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '12:00', end: '13:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
      { start: '16:00', end: '17:00' },
    ];

    const targetDate = new Date(dto.date);
    const capacity = dto.capacityPerSlot || 15;

    const createdSlots = [];

    for (const w of defaultWindows) {
      const slot = await this.prisma.slot.upsert({
        where: {
          scheduleId_slotDate_startTime: {
            scheduleId: dto.scheduleId,
            slotDate: targetDate,
            startTime: w.start,
          },
        },
        create: {
          scheduleId: dto.scheduleId,
          slotDate: targetDate,
          startTime: w.start,
          endTime: w.end,
          capacity,
          bookedCount: 0,
          status: SlotStatus.AVAILABLE,
        },
        update: {
          capacity,
        },
      });
      createdSlots.push(slot);
    }

    return createdSlots;
  }
}
