# Subscription Module

Payment processing and credit system.

## Overview

- **Location**: `src/modules/subscription/`
- **Entities**: `Subscription`, `Plan`, `UserCredits`
- **Payment**: Stripe integration

## Features

### Subscription Plans

- Multiple plan tiers (Free, Pro, Enterprise)
- Monthly/yearly billing cycles
- Feature limits per plan

### Stripe Integration

- Checkout session creation
- Webhook handling for payment events
- Subscription lifecycle management

### Credits System

- AI features consume credits
- Credits reset on billing cycle
- Usage tracking via `AiUsage` entity

## Entity Structure

```typescript
interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  credits: number;
  features: string[];
  stripeProductId: string;
  stripePriceId: string;
}

interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  stripeSubscriptionId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

interface UserCredits {
  id: string;
  userId: string;
  balance: number;
  lastResetAt: Date;
}
```

## Key Services

| Service               | Purpose                               |
| --------------------- | ------------------------------------- |
| `SubscriptionService` | Subscription logic, credit management |
| `StripeService`       | Stripe API integration                |

## API Endpoints

```
GET    /subscription           # Get current subscription
GET    /subscription/plans     # List available plans
POST   /subscription/checkout  # Create checkout session
POST   /subscription/webhook   # Stripe webhook [Public]
POST   /subscription/cancel    # Cancel subscription
GET    /subscription/usage     # Get credit usage
```

## Webhook Events

| Event                           | Action              |
| ------------------------------- | ------------------- |
| `checkout.session.completed`    | Create subscription |
| `invoice.paid`                  | Reset credits       |
| `customer.subscription.updated` | Update status       |
| `customer.subscription.deleted` | Mark cancelled      |

## Configuration

```bash
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_SUCCESS_URL=https://app.example.com/subscription/success
STRIPE_CANCEL_URL=https://app.example.com/subscription/cancel
```
