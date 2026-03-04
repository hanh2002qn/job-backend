import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    description: 'Plan slug from the plans table (e.g., "premium_monthly", "premium_yearly")',
    example: 'premium_monthly',
  })
  @IsNotEmpty()
  @IsString()
  plan: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  promoCode?: string;
}
