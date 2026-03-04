# Integration Guide: admin/coupons Module

This document provides frontend integration details for the **admin/coupons** module.

## Endpoints

### List all coupons

> **GET** `/api/admin/coupons`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

`Any Object`

---

### Create a new coupon

> **POST** `/api/admin/coupons`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field                | Type     | Required | Description |
| -------------------- | -------- | -------- | ----------- |
| `percent_off`        | `number` | ❌       |             |
| `amount_off`         | `number` | ❌       |             |
| `currency`           | `string` | ❌       |             |
| `duration`           | `string` | ❌       |             |
| `duration_in_months` | `number` | ❌       |             |
| `name`               | `string` | ❌       |             |

#### Responses

**201**:

`Any Object`

---

### Delete a coupon

> **DELETE** `/api/admin/coupons/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**200**:

`Any Object`

---
