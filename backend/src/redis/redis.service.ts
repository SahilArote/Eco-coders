import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis as UpstashRedis } from '@upstash/redis';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RedisMock = require('ioredis-mock');

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private upstashClient: UpstashRedis | null = null;
  private mockClient: any = null;
  private isUsingUpstash = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const upstashUrl = this.configService.get<string>('UPSTASH_REDIS_REST_URL') || process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN') || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (upstashUrl && upstashToken) {
      try {
        this.upstashClient = new UpstashRedis({
          url: upstashUrl,
          token: upstashToken,
        });

        // Test connection
        await this.upstashClient.ping();
        this.isUsingUpstash = true;
        this.logger.log('Successfully connected to Upstash Cloud Redis via REST');
        return;
      } catch (err) {
        this.logger.warn(`Failed to connect to Upstash Redis: ${err.message}. Falling back to in-memory store.`);
      }
    }

    this.activateMock();
  }

  private activateMock() {
    this.mockClient = new RedisMock();
    this.logger.log('In-memory transient queue and cache store active (zero external dependencies)');
  }

  async get(key: string): Promise<string | null> {
    if (this.isUsingUpstash && this.upstashClient) {
      const res = await this.upstashClient.get<any>(key);
      return res ? (typeof res === 'object' ? JSON.stringify(res) : String(res)) : null;
    }
    return this.mockClient.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK' | string> {
    if (this.isUsingUpstash && this.upstashClient) {
      if (ttlSeconds) {
        return this.upstashClient.set(key, value, { ex: ttlSeconds });
      }
      return this.upstashClient.set(key, value);
    }
    if (ttlSeconds) {
      return this.mockClient.set(key, value, 'EX', ttlSeconds);
    }
    return this.mockClient.set(key, value);
  }

  async del(key: string): Promise<number> {
    if (this.isUsingUpstash && this.upstashClient) {
      return this.upstashClient.del(key);
    }
    return this.mockClient.del(key);
  }

  async incr(key: string): Promise<number> {
    if (this.isUsingUpstash && this.upstashClient) {
      return this.upstashClient.incr(key);
    }
    return this.mockClient.incr(key);
  }

  async zadd(key: string, score: number, member: string): Promise<number | string> {
    if (this.isUsingUpstash && this.upstashClient) {
      return this.upstashClient.zadd(key, { score, member });
    }
    return this.mockClient.zadd(key, score, member);
  }

  async zrem(key: string, member: string): Promise<number> {
    if (this.isUsingUpstash && this.upstashClient) {
      return this.upstashClient.zrem(key, member);
    }
    return this.mockClient.zrem(key, member);
  }

  async zcard(key: string): Promise<number> {
    if (this.isUsingUpstash && this.upstashClient) {
      return this.upstashClient.zcard(key);
    }
    return this.mockClient.zcard(key);
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    if (this.isUsingUpstash && this.upstashClient) {
      const res = await this.upstashClient.zrange<string[]>(key, start, stop);
      return (res || []).map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)));
    }
    return this.mockClient.zrange(key, start, stop);
  }

  async zrank(key: string, member: string): Promise<number | null> {
    if (this.isUsingUpstash && this.upstashClient) {
      return this.upstashClient.zrank(key, member);
    }
    return this.mockClient.zrank(key, member);
  }
}
