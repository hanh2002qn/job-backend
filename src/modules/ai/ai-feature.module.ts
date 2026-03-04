import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiFeatureConfig } from './entities/ai-feature-config.entity';
import { AiUsage } from './entities/ai-usage.entity';
import { AdminAiService } from '../admin/services/admin-ai.service';
import { AiFeatureGuard } from '../../common/guards/ai-feature.guard';
import { SubscriptionModule } from '../subscription/subscription.module';

/**
 * Lightweight global module that provides AiFeatureGuard and AdminAiService.
 * Separated from AdminModule to avoid circular dependencies since
 * AiFeatureGuard is used across many feature modules.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AiFeatureConfig, AiUsage]), SubscriptionModule],
  providers: [AdminAiService, AiFeatureGuard],
  exports: [AdminAiService, AiFeatureGuard],
})
export class AiFeatureModule {}
