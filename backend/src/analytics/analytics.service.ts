import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProcurementStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSystemOverview() {
    const [
      totalFarmers,
      totalCenters,
      totalBookings,
      completedProcurements,
      totalPayments,
      crops,
    ] = await Promise.all([
      this.prisma.farmer.count(),
      this.prisma.procurementCenter.count(),
      this.prisma.booking.count(),
      this.prisma.procurement.count({ where: { status: ProcurementStatus.COMPLETED } }),
      this.prisma.payment.aggregate({
        _sum: { amount: true, quantityQuintals: true },
      }),
      this.prisma.crop.findMany({ select: { id: true, name: true } }),
    ]);

    const statusBreakdown = await this.prisma.booking.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const statusCounts = statusBreakdown.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      overview: {
        totalRegisteredFarmers: totalFarmers,
        totalProcurementCenters: totalCenters,
        totalBookingsInitiated: totalBookings,
        totalProcurementsCompleted: completedProcurements,
        totalDisbursedAmountInr: Number(totalPayments._sum.amount || 0),
        totalProcuredQuintals: Number(totalPayments._sum.quantityQuintals || 0),
      },
      statusDistribution: {
        booked: statusCounts[ProcurementStatus.BOOKED] || 0,
        arrived: statusCounts[ProcurementStatus.ARRIVED] || 0,
        waiting: statusCounts[ProcurementStatus.WAITING] || 0,
        processing: statusCounts[ProcurementStatus.PROCESSING] || 0,
        qualityCheck: statusCounts[ProcurementStatus.QUALITY_CHECK] || 0,
        weighment: statusCounts[ProcurementStatus.WEIGHMENT] || 0,
        accepted: statusCounts[ProcurementStatus.ACCEPTED] || 0,
        rejected: statusCounts[ProcurementStatus.REJECTED] || 0,
        completed: statusCounts[ProcurementStatus.COMPLETED] || 0,
        paymentCompleted: statusCounts[ProcurementStatus.PAYMENT_COMPLETED] || 0,
      },
      cropsAvailable: crops.length,
    };
  }

  async getCenterAnalytics(centerId: string) {
    const center = await this.prisma.procurementCenter.findUnique({
      where: { id: centerId },
      include: { counters: true },
    });

    if (!center) return null;

    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    const [todayBookings, todayCompleted, todayDisbursed] = await Promise.all([
      this.prisma.booking.count({
        where: { centerId, createdAt: { gte: todayStart } },
      }),
      this.prisma.booking.count({
        where: { centerId, status: ProcurementStatus.COMPLETED, createdAt: { gte: todayStart } },
      }),
      this.prisma.payment.aggregate({
        where: {
          procurement: { centerId },
          createdAt: { gte: todayStart },
        },
        _sum: { amount: true, quantityQuintals: true },
      }),
    ]);

    return {
      centerId: center.id,
      centerName: center.name,
      activeCounters: center.counters.filter((c) => c.status === 'ACTIVE').length,
      totalCounters: center.counters.length,
      todayStats: {
        totalBookings: todayBookings,
        completedFarmers: todayCompleted,
        totalQuintalsProcured: Number(todayDisbursed._sum.quantityQuintals || 0),
        payoutAmount: Number(todayDisbursed._sum.amount || 0),
      },
    };
  }
}
