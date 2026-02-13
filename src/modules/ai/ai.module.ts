import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { GroqService } from './groq.service';
import { Prompt } from './entities/prompt.entity';
import { AiUsage } from './entities/ai-usage.entity';
import { AiFeatureConfig } from './entities/ai-feature-config.entity';
import { LLM_SERVICE } from './llm.interface';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Prompt, AiUsage, AiFeatureConfig])],
  providers: [
    GeminiService,
    GroqService,
    {
      provide: LLM_SERVICE,
      useFactory: (gemini: GeminiService, groq: GroqService, config: ConfigService) => {
        const provider = config.get<string>('LLM_PROVIDER') || 'gemini';
        return provider === 'groq' ? groq : gemini;
      },
      inject: [GeminiService, GroqService, ConfigService],
    },
  ],
  exports: [LLM_SERVICE, GeminiService, GroqService, TypeOrmModule],
})
export class AIModule {}
