import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditRecord {
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
  requestId?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(record: AuditRecord) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          actorId: record.actorId,
          actorRole: record.actorRole,
          action: record.action,
          entityType: record.entityType,
          entityId: record.entityId,
          oldValue: record.oldValue || null,
          newValue: record.newValue || null,
          ipAddress: record.ipAddress || null,
          requestId: record.requestId || null,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to write audit log: ${err.message}`);
    }
  }

  async getLogs(params: { entityType?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({
        where: params.entityType ? { entityType: params.entityType } : {},
      }),
      this.prisma.auditLog.findMany({
        where: params.entityType ? { entityType: params.entityType } : {},
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }
}
