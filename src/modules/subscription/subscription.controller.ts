import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('subscription')
@Controller('subscription')
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) { }

    @Post('checkout')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create Stripe Checkout Session' })
    createCheckoutSession(@Request() req, @Body() createDto: CreateCheckoutSessionDto) {
        return this.subscriptionService.createCheckoutSession(req.user.id, createDto);
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Stripe Webhook Handler' })
    handleWebhook(@Body() body: any) {
        return this.subscriptionService.handleWebhook(body);
    }

    @Get('me')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current subscription status' })
    getMySubscription(@Request() req) {
        return this.subscriptionService.getSubscription(req.user.id);
    }
}
