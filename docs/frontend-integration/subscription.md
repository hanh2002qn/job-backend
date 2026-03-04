# Integration Guide: subscription Module

This document provides frontend integration details for the **subscription** module.

## Endpoints

### Create Stripe Checkout Session

> **POST** `/api/subscription/checkout`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field       | Type     | Required | Description                                                                |
| ----------- | -------- | -------- | -------------------------------------------------------------------------- |
| `plan`      | `string` | ✅       | Plan slug from the plans table (e.g., "premium_monthly", "premium_yearly") |
| `promoCode` | `string` | ❌       |                                                                            |

#### Responses

**201**:

---

### Stripe Webhook Handler

> **POST** `/api/subscription/webhook`

#### Parameters (Path / Query)

| Name               | In       | Required | Type     | Description |
| ------------------ | -------- | -------- | -------- | ----------- |
| `stripe-signature` | `header` | ✅       | `string` |             |

#### Responses

**201**:

---

### Cancel subscription at period end

> **POST** `/api/subscription/cancel`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**201**:

---

### Get current subscription status

> **GET** `/api/subscription/me`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

`Any Object`

---
