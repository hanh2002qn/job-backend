import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiService } from './gemini.service';
import { Prompt } from './entities/prompt.entity';
import { AiUsage } from './entities/ai-usage.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Prompt, AiUsage])],
  providers: [GeminiService],
  exports: [GeminiService, TypeOrmModule],
})
export class AIModule {}
