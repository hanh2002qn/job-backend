# Integration Guide: admin/plans Module

This document provides frontend integration details for the **admin/plans** module.

## Endpoints

### Get all subscription plans 
> **GET** `/api/admin/plans`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: List of plans returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `slug` | `string` | ✅ |  |
| `name` | `string` | ✅ |  |
| `description` | `string` | ✅ |  |
| `price` | `number` | ✅ |  |
| `currency` | `string` | ✅ |  |
| `interval` | `object` | ✅ |  |
| `limits` | `object` | ✅ |  |
| `isActive` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |



---

### Create new plan 
> **POST** `/api/admin/plans`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**201**: Plan created.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `slug` | `string` | ✅ |  |
| `name` | `string` | ✅ |  |
| `description` | `string` | ✅ |  |
| `price` | `number` | ✅ |  |
| `currency` | `string` | ✅ |  |
| `interval` | `object` | ✅ |  |
| `limits` | `object` | ✅ |  |
| `isActive` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |



---

### Get plan detail 
> **GET** `/api/admin/plans/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Plan ID (UUID) |

#### Responses
**200**: Plan detail returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `slug` | `string` | ✅ |  |
| `name` | `string` | ✅ |  |
| `description` | `string` | ✅ |  |
| `price` | `number` | ✅ |  |
| `currency` | `string` | ✅ |  |
| `interval` | `object` | ✅ |  |
| `limits` | `object` | ✅ |  |
| `isActive` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**404**: Plan not found.

---

### Update plan (e.g., changes limits) 
> **PATCH** `/api/admin/plans/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Plan ID (UUID) |

#### Responses
**200**: Plan updated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `slug` | `string` | ✅ |  |
| `name` | `string` | ✅ |  |
| `description` | `string` | ✅ |  |
| `price` | `number` | ✅ |  |
| `currency` | `string` | ✅ |  |
| `interval` | `object` | ✅ |  |
| `limits` | `object` | ✅ |  |
| `isActive` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**404**: Plan not found.

---

