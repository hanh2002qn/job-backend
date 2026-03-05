import { SetMetadata } from '@nestjs/common';
import { PlanLimits } from '../../modules/subscription/entities/plan.entity';

export const CHECK_LIMIT_KEY = 'checkLimit';
export const CheckLimit = (limitField: keyof PlanLimits) =>
  SetMetadata(CHECK_LIMIT_KEY, limitField);
