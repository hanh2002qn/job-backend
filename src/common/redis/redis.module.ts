import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { CacheService } from './cache.service';
import { QUEUES } from './queue.constants';

@Global()
@Module({
  imports: [
    // BullMQ queues
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD', ''),
        },
      }),
      inject: [ConfigService],
    }),

    // Register queues
    BullModule.registerQueue(
      { name: QUEUES.CRAWLER },
      { name: QUEUES.CRAWLER_DETAIL },
      { name: QUEUES.EMAIL },
      { name: QUEUES.NOTIFICATION },
      { name: QUEUES.ANALYTICS },
    ),

    // Cache with Redis
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD', ''),
          ttl: 60 * 1000, // default 1 minute in ms
        });
        return { store };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [BullModule, CacheModule, CacheService],
})
export class RedisModule {}
