import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateCenterDto, UpdateCenterDto } from './dto/create-center.dto';
import { ErrorCode } from '../common/constants/error-codes';

@Injectable()
export class CentersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  async findAll(params?: {
    district?: string;
    cropId?: string;
    userLat?: number;
    userLon?: number;
  }) {
    const centers = await this.prisma.procurementCenter.findMany({
      where: {
        ...(params?.district && { district: { contains: params.district, mode: 'insensitive' } }),
        ...(params?.cropId && {
          schedules: {
            some: {
              cropId: params.cropId,
              status: 'ACTIVE',
            },
          },
        }),
      },
      include: {
        counters: true,
        schedules: {
          where: { status: 'ACTIVE' },
          select: { cropId: true },
        },
      },
    });

    return centers.map((center) => {
      const activeCounters = center.counters.filter((c) => c.status === 'ACTIVE').length;
      const acceptedCropIds = Array.from(new Set(center.schedules.map((s) => s.cropId)));
      const lat = Number(center.latitude);
      const lon = Number(center.longitude);

      let distanceKm = 5.0; // default approximate distance
      if (params?.userLat && params?.userLon) {
        distanceKm = this.calculateDistanceKm(params.userLat, params.userLon, lat, lon);
      }

      return {
        id: center.id,
        code: center.code,
        name: center.name,
        address: center.address,
        village: center.village,
        district: center.district,
        state: center.state,
        latitude: lat,
        longitude: lon,
        distanceKm,
        status: center.status,
        activeCounters,
        totalCounters: center.counters.length,
        dailyCapacityQuintals: center.dailyCapacityQuintals,
        acceptedCropIds,
        contactPhone: center.contactPhone,
      };
    });
  }

  async findOne(id: string) {
    const center = await this.prisma.procurementCenter.findUnique({
      where: { id },
      include: {
        counters: true,
        schedules: {
          where: { status: 'ACTIVE' },
          include: { crop: true },
        },
      },
    });

    if (!center) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: `Procurement center with ID ${id} not found.`,
      });
    }

    const activeCounters = center.counters.filter((c) => c.status === 'ACTIVE').length;
    const acceptedCropIds = Array.from(new Set(center.schedules.map((s) => s.cropId)));

    return {
      id: center.id,
      code: center.code,
      name: center.name,
      address: center.address,
      village: center.village,
      district: center.district,
      state: center.state,
      latitude: Number(center.latitude),
      longitude: Number(center.longitude),
      distanceKm: 4.8,
      status: center.status,
      activeCounters,
      totalCounters: center.counters.length,
      dailyCapacityQuintals: center.dailyCapacityQuintals,
      acceptedCropIds,
      contactPhone: center.contactPhone,
      counters: center.counters,
      schedules: center.schedules,
    };
  }

  async create(dto: CreateCenterDto) {
    const existing = await this.prisma.procurementCenter.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException({
        code: ErrorCode.VALIDATION_FAILED,
        message: `Center code ${dto.code} is already registered.`,
      });
    }

    const center = await this.prisma.procurementCenter.create({
      data: {
        code: dto.code,
        name: dto.name,
        address: dto.address,
        village: dto.village,
        district: dto.district,
        state: dto.state,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: dto.status,
        dailyCapacityQuintals: dto.dailyCapacityQuintals,
        contactPhone: dto.contactPhone,
      },
    });

    // Auto-create default counters (1 to 4)
    for (let i = 1; i <= 4; i++) {
      await this.prisma.counter.create({
        data: {
          centerId: center.id,
          counterNumber: i,
          status: 'ACTIVE',
        },
      });
    }

    return this.findOne(center.id);
  }

  async update(id: string, dto: UpdateCenterDto) {
    await this.findOne(id);
    return this.prisma.procurementCenter.update({
      where: { id },
      data: dto,
    });
  }
}
