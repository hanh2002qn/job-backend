import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiService } from './gemini.service';
import { GroqService } from './groq.service';
import { OpenAIService } from './openai.service';
import { Prompt } from './entities/prompt.entity';
import { AiUsage } from './entities/ai-usage.entity';
import { AiFeatureConfig } from './entities/ai-feature-config.entity';
import { LLM_SERVICE } from './llm.interface';
import { SettingsModule } from '../settings/settings.module';
import { SettingsService } from '../settings/settings.service';
import { RedisModule } from '../../common/redis/redis.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Prompt, AiUsage, AiFeatureConfig]),
    SettingsModule,
    RedisModule,
  ],
  providers: [
    GeminiService,
    GroqService,
    OpenAIService,
    {
      provide: LLM_SERVICE,
      useFactory: (
        gemini: GeminiService,
        groq: GroqService,
        openai: OpenAIService,
        settings: SettingsService,
      ) => {
        const provider = settings.getSettingFromCache<string>('llm_provider') || 'gemini';
        if (provider === 'openai') return openai;
        if (provider === 'groq') return groq;
        return gemini;
      },
      inject: [GeminiService, GroqService, OpenAIService, SettingsService],
    },
  ],
  exports: [LLM_SERVICE, GeminiService, GroqService, OpenAIService, TypeOrmModule],
})
export class AIModule {}
