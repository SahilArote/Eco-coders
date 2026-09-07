import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PredictWaitTimeRequest {
  centerId: string;
  queueLength: number;
  activeCounters: number;
  averageProcessingMinutes?: number;
  arrivalsLast30Minutes?: number;
  hourOfDay?: number;
  dayOfWeek?: number;
}

export interface PredictWaitTimeResponse {
  estimatedWaitMinutes: number;
  modelVersion: string;
  isAiPrediction: boolean;
  confidence: number;
}

@Injectable()
export class MlService {
  private readonly logger = new Logger(MlService.name);
  private readonly mlServiceUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.mlServiceUrl = this.configService.get<string>('mlService.url', 'http://localhost:8000');
    this.timeoutMs = this.configService.get<number>('mlService.timeoutMs', 1000);
  }

  async predictWaitTime(req: PredictWaitTimeRequest): Promise<PredictWaitTimeResponse> {
    const avgProcTime = req.averageProcessingMinutes || 11.0;
    const counters = Math.max(1, req.activeCounters || 1);

    // Baseline fallback formula
    const fallbackEstimate = Math.max(0, Math.ceil((req.queueLength * avgProcTime) / counters));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.mlServiceUrl}/predict/waiting-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centerId: req.centerId,
          queueLength: req.queueLength,
          activeCounters: counters,
          averageProcessingMinutes: avgProcTime,
          arrivalsLast30Minutes: req.arrivalsLast30Minutes || 5,
          hourOfDay: req.hourOfDay ?? new Date().getHours(),
          dayOfWeek: req.dayOfWeek ?? new Date().getDay(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = (await response.json()) as any;
        return {
          estimatedWaitMinutes: Math.round(data.estimatedWaitMinutes ?? fallbackEstimate),
          modelVersion: data.modelVersion || 'fastapi-wait-v1.0',
          isAiPrediction: true,
          confidence: Number(data.confidence || 0.88),
        };
      }
    } catch (err: any) {
      this.logger.debug(`ML service unavailable (${err.message}). Using deterministic fallback.`);
    }

    return {
      estimatedWaitMinutes: fallbackEstimate,
      modelVersion: 'deterministic-baseline-v1.0',
      isAiPrediction: false,
      confidence: 0.85,
    };
  }
}
