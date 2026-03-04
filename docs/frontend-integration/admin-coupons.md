# Integration Guide: admin/coupons Module

This document provides frontend integration details for the **admin/coupons** module.

## Endpoints

### List all coupons 
> **GET** `/api/admin/coupons`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: List of coupons returned.
**401**: Unauthorized.
**403**: Forbidden. Admin role required.

---

### Create a new coupon 
> **POST** `/api/admin/coupons`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `percent_off` | `number` | ❌ |  |
| `amount_off` | `number` | ❌ |  |
| `currency` | `string` | ❌ |  |
| `duration` | `string` | ❌ |  |
| `duration_in_months` | `number` | ❌ |  |
| `name` | `string` | ❌ |  |

#### Responses
**201**: Coupon created.
**400**: Invalid coupon parameters.

---

### Delete a coupon 
> **DELETE** `/api/admin/coupons/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Stripe coupon ID |

#### Responses
**200**: Coupon deleted.
**404**: Coupon not found.

---

