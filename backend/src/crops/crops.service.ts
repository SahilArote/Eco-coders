import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { ErrorCode } from '../common/constants/error-codes';

@Injectable()
export class CropsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(activeOnly = true) {
    const crops = await this.prisma.crop.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { name: 'asc' },
    });

    return crops.map((crop) => ({
      id: crop.id,
      code: crop.code,
      name: crop.name,
      nameHi: crop.nameHi || crop.name,
      category: crop.category,
      mspRatePerQuintal: Number(crop.mspRatePerQuintal),
      unit: crop.unit,
      isActive: crop.isActive,
    }));
  }

  async findOne(id: string) {
    const crop = await this.prisma.crop.findUnique({
      where: { id },
    });

    if (!crop) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: `Crop with ID ${id} not found.`,
      });
    }

    return {
      id: crop.id,
      code: crop.code,
      name: crop.name,
      nameHi: crop.nameHi || crop.name,
      category: crop.category,
      mspRatePerQuintal: Number(crop.mspRatePerQuintal),
      unit: crop.unit,
      isActive: crop.isActive,
    };
  }

  async create(dto: CreateCropDto) {
    const existing = await this.prisma.crop.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException({
        code: ErrorCode.VALIDATION_FAILED,
        message: `Crop with code ${dto.code} already exists.`,
      });
    }

    const crop = await this.prisma.crop.create({
      data: {
        code: dto.code,
        name: dto.name,
        nameHi: dto.nameHi,
        category: dto.category,
        mspRatePerQuintal: dto.mspRatePerQuintal,
        unit: dto.unit || 'Quintal',
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });

    return this.findOne(crop.id);
  }
}
