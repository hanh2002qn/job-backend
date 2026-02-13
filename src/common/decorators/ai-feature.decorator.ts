import { SetMetadata } from '@nestjs/common';

export const AI_FEATURE_KEY = 'ai-feature';

/**
 * Decorator to mark an endpoint as requiring a specific AI feature to be enabled.
 * Use together with AiFeatureGuard.
 *
 * @example
 * ```typescript
 * @UseGuards(AiFeatureGuard)
 * @AiFeature('cv_parsing')
 * @Post('parse')
 * async parseCv() { ... }
 * ```
 */
export const AiFeature = (featureKey: string) => SetMetadata(AI_FEATURE_KEY, featureKey);
