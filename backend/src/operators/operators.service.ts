import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignOperatorDto } from './dto/assign-operator.dto';
import { ErrorCode } from '../common/constants/error-codes';
import { Role, ProcurementStatus } from '@prisma/client';

@Injectable()
export class OperatorsService {
  constructor(private readonly prisma: PrismaService) {}

  async assignOperator(dto: AssignOperatorDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: `User ${dto.userId} not found`,
      });
    }

    if (user.role !== Role.CENTER_OPERATOR) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'User must hold the role CENTER_OPERATOR to be assigned to a center',
      });
    }

    const center = await this.prisma.procurementCenter.findUnique({
      where: { id: dto.centerId },
    });

    if (!center) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: `Procurement Center ${dto.centerId} not found`,
      });
    }

    return this.prisma.centerOperator.upsert({
      where: { userId: dto.userId },
      create: {
        userId: dto.userId,
        centerId: dto.centerId,
      },
      update: {
        centerId: dto.centerId,
      },
      include: {
        center: true,
        user: { select: { id: true, phone: true, email: true } },
      },
    });
  }

  async getCenterOperators(centerId: string) {
    return this.prisma.centerOperator.findMany({
      where: { centerId },
      include: {
        user: { select: { id: true, phone: true, email: true, status: true } },
        counters: true,
      },
    });
  }

  async getDashboardSummary(centerId: string) {
    const center = await this.prisma.procurementCenter.findUnique({
      where: { id: centerId },
      include: { counters: true },
    });

    if (!center) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Center not found',
      });
    }

    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    const [bookedCount, arrivedCount, waitingCount, processingCount, completedCount, activeCounters] =
      await Promise.all([
        this.prisma.booking.count({
          where: { centerId, status: ProcurementStatus.BOOKED, createdAt: { gte: todayStart } },
        }),
        this.prisma.booking.count({
          where: { centerId, status: ProcurementStatus.ARRIVED, createdAt: { gte: todayStart } },
        }),
        this.prisma.booking.count({
          where: { centerId, status: ProcurementStatus.WAITING, createdAt: { gte: todayStart } },
        }),
        this.prisma.booking.count({
          where: { centerId, status: ProcurementStatus.PROCESSING, createdAt: { gte: todayStart } },
        }),
        this.prisma.booking.count({
          where: { centerId, status: ProcurementStatus.COMPLETED, createdAt: { gte: todayStart } },
        }),
        this.prisma.counter.count({
          where: { centerId, status: 'ACTIVE' },
        }),
      ]);

    const totalInCenter = arrivedCount + waitingCount + processingCount;
    const avgWaitMinutes = Math.round((totalInCenter * 11) / Math.max(1, activeCounters));

    return {
      centerId,
      centerName: center.name,
      metrics: {
        bookedToday: bookedCount,
        arrived: arrivedCount,
        waitingInQueue: waitingCount,
        currentlyProcessing: processingCount,
        completedToday: completedCount,
        activeCounters,
        totalCounters: center.counters.length,
        estimatedAverageWaitMinutes: avgWaitMinutes,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
