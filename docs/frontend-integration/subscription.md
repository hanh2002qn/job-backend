# Integration Guide: subscription Module

This document provides frontend integration details for the **subscription** module.

## Endpoints

### Create Stripe Checkout Session 
> **POST** `/api/subscription/checkout`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `plan` | `string` | ✅ | Plan slug from the plans table (e.g., "premium_monthly", "premium_yearly") |
| `promoCode` | `string` | ❌ |  |

#### Responses
**201**: Checkout session created.
**401**: Unauthorized.

---

### Stripe Webhook Handler 
> **POST** `/api/subscription/webhook`

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `stripe-signature` | `header` | ✅ | `string` |  |

#### Responses
**200**: Webhook processed.
**201**: 
**400**: Missing signature or invalid payload.

---

### Cancel subscription at period end 
> **POST** `/api/subscription/cancel`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**201**: Subscription cancelled at period end.
**401**: Unauthorized.

---

### Get current subscription status 
> **GET** `/api/subscription/me`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Subscription status returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `planId` | `string` | ✅ |  |
| `planDetails` | `Plan` | ✅ |  |
| `status` | `string` | ✅ |  |
| `stripeSubscriptionId` | `string` | ✅ |  |
| `stripeCustomerId` | `string` | ✅ |  |
| `expiresAt` | `string` | ✅ |  |
| `cancelAtPeriodEnd` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

