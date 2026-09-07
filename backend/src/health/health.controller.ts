import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'System Health Check', description: 'Checks database and cache connectivity' })
  @ApiResponse({ status: 200, description: 'System healthy' })
  async check() {
    let dbStatus = 'UP';
    let redisStatus = 'UP';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'DOWN';
    }

    try {
      await this.redis.set('health_check', 'ok', 5);
    } catch (e) {
      redisStatus = 'DOWN';
    }

    return {
      status: dbStatus === 'UP' ? 'healthy' : 'degraded',
      services: {
        database: dbStatus,
        cache: redisStatus,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
