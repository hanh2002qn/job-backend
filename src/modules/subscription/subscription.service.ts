import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionPlan } from './entities/subscription.entity';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@Injectable()
export class SubscriptionService {
    constructor(
        @InjectRepository(Subscription)
        private subscriptionRepository: Repository<Subscription>,
    ) { }

    async createCheckoutSession(userId: string, createDto: CreateCheckoutSessionDto) {
        // MOCK STRIPE CHECKOUT SESSION
        // In reality, call Stripe API here
        return {
            sessionId: 'mock_session_id_123',
            url: `https://mock-stripe-checkout.com/pay?plan=${createDto.plan}&user=${userId}`,
        };
    }

    async handleWebhook(body: any) {
        // MOCK STRIPE WEBHOOK HANDLER
        // Check signature, event type, etc.
        const { type, data } = body;

        if (type === 'checkout.session.completed') {
            const userId = data.object.metadata.userId; // Mock metadata

            // Update or create subscription
            // Implementation omitted for brevity in mock
            console.log(`[MOCK WEBHOOK] Subscription activated for user ${userId}`);
        }

        return { received: true };
    }

    async getSubscription(userId: string) {
        return this.subscriptionRepository.findOne({ where: { userId } });
    }
}
