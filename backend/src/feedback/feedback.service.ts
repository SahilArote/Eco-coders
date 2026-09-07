import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ErrorCode } from '../common/constants/error-codes';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async submitFeedback(userId: string, dto: CreateFeedbackDto) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
    });

    if (!farmer) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Farmer profile not found.',
      });
    }

    return this.prisma.feedback.create({
      data: {
        farmerId: farmer.id,
        bookingId: dto.bookingId || null,
        category: dto.category,
        rating: dto.rating,
        comments: dto.comments,
      },
    });
  }

  async getAllFeedback() {
    return this.prisma.feedback.findMany({
      include: {
        farmer: {
          select: { fullName: true, village: true, district: true },
        },
        booking: {
          include: { crop: { select: { name: true } }, center: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
