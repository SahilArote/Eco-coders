import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorCode } from '../common/constants/error-codes';

@Injectable()
export class CountersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCenter(centerId: string) {
    return this.prisma.counter.findMany({
      where: { centerId },
      include: {
        operator: {
          include: {
            user: { select: { phone: true, email: true } },
          },
        },
      },
      orderBy: { counterNumber: 'asc' },
    });
  }

  async updateCounterStatus(counterId: string, status: string, operatorId?: string) {
    const counter = await this.prisma.counter.findUnique({
      where: { id: counterId },
    });

    if (!counter) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: `Counter ${counterId} not found`,
      });
    }

    return this.prisma.counter.update({
      where: { id: counterId },
      data: {
        status,
        ...(operatorId !== undefined && { operatorId }),
      },
    });
  }
}
