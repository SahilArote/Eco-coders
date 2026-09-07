import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { ErrorCode } from '../common/constants/error-codes';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCenter(centerId: string) {
    return this.prisma.procurementSchedule.findMany({
      where: { centerId },
      include: {
        crop: true,
        _count: { select: { slots: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async create(dto: CreateScheduleDto) {
    const center = await this.prisma.procurementCenter.findUnique({
      where: { id: dto.centerId },
    });

    if (!center) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: `Center ${dto.centerId} not found`,
      });
    }

    const crop = await this.prisma.crop.findUnique({
      where: { id: dto.cropId },
    });

    if (!crop) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: `Crop ${dto.cropId} not found`,
      });
    }

    return this.prisma.procurementSchedule.create({
      data: {
        centerId: dto.centerId,
        cropId: dto.cropId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        dailyCapacity: dto.dailyCapacity,
        status: dto.status || 'ACTIVE',
      },
      include: { crop: true },
    });
  }
}
