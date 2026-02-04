import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { SubscriptionService } from './subscription.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create Stripe Checkout Session' })
  createCheckoutSession(@CurrentUser() user: User, @Body() createDto: CreateCheckoutSessionDto) {
    return this.subscriptionService.createCheckoutSession(user.id, user.email, createDto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe Webhook Handler' })
  async handleWebhook(@Req() req: Request, @Headers('stripe-signature') signature: string) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    // Note: To use req.body as a Buffer for Stripe signature verification,
    // ensure the NestJS app is configured with a raw-body parser for this route.
    return this.subscriptionService.handleWebhook(req.body, signature);
  }

  @Post('cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel subscription at period end' })
  cancelSubscription(@CurrentUser() user: User) {
    return this.subscriptionService.cancelSubscription(user.id);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current subscription status' })
  getMySubscription(@CurrentUser() user: User) {
    return this.subscriptionService.getSubscription(user.id);
  }
}
