import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan } from '../entities/subscription.entity';

export class CreateCheckoutSessionDto {
    @ApiProperty({ enum: SubscriptionPlan, default: SubscriptionPlan.PREMIUM })
    @IsNotEmpty()
    @IsEnum(SubscriptionPlan)
    plan: SubscriptionPlan;
}
