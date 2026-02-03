import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { StripeWebhookEvent } from './interfaces/stripe-webhook.interface';
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
    return this.subscriptionService.createCheckoutSession(user.id, createDto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe Webhook Handler' })
  handleWebhook(@Body() body: StripeWebhookEvent) {
    return this.subscriptionService.handleWebhook(body);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current subscription status' })
  getMySubscription(@CurrentUser() user: User) {
    return this.subscriptionService.getSubscription(user.id);
  }
}
