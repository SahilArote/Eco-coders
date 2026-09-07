import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { RealtimeModule } from './realtime/realtime.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { FarmersModule } from './farmers/farmers.module';
import { CentersModule } from './centers/centers.module';
import { CropsModule } from './crops/crops.module';
import { CountersModule } from './counters/counters.module';
import { OperatorsModule } from './operators/operators.module';
import { SchedulesModule } from './schedules/schedules.module';
import { SlotsModule } from './slots/slots.module';
import { BookingsModule } from './bookings/bookings.module';
import { QueueModule } from './queue/queue.module';
import { ProcurementModule } from './procurement/procurement.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MlModule } from './ml/ml.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuditModule } from './audit/audit.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    RedisModule,
    RealtimeModule,
    HealthModule,
    AuthModule,
    FarmersModule,
    CentersModule,
    CropsModule,
    CountersModule,
    OperatorsModule,
    SchedulesModule,
    SlotsModule,
    BookingsModule,
    QueueModule,
    ProcurementModule,
    PaymentsModule,
    NotificationsModule,
    MlModule,
    AnalyticsModule,
    AuditModule,
    FeedbackModule,
  ],
})
export class AppModule {}
