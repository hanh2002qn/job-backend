import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiService } from './gemini.service';
import { GroqService } from './groq.service';
import { OpenAIService } from './openai.service';
import { LlmRouterService } from './llm-router.service';
import { Prompt } from './entities/prompt.entity';
import { AiUsage } from './entities/ai-usage.entity';

import { LLM_SERVICE } from './llm.interface';
import { SettingsModule } from '../settings/settings.module';
import { RedisModule } from '../../common/redis/redis.module';
import { PromptRepository } from './prompt.repository';

import { AiUsageRepository } from './ai-usage.repository';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Prompt, AiUsage]), SettingsModule, RedisModule],
  providers: [
    GeminiService,
    GroqService,
    OpenAIService,
    LlmRouterService,
    {
      provide: LLM_SERVICE,
      useExisting: LlmRouterService,
    },
    PromptRepository,

    AiUsageRepository,
  ],
  exports: [
    LLM_SERVICE,
    GeminiService,
    GroqService,
    OpenAIService,
    LlmRouterService,
    TypeOrmModule,
    PromptRepository,

    AiUsageRepository,
  ],
})
export class AIModule {}
