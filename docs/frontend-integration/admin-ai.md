# Integration Guide: Admin AI Module

This document provides frontend integration details for the **Admin AI** module.

## Endpoints

### List all AI feature configs 
> **GET** `/api/admin/ai/features`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: AI feature configs returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `featureKey` | `string` | ✅ |  |
| `displayName` | `string` | ✅ |  |
| `description` | `string` | ✅ |  |
| `isEnabled` | `boolean` | ✅ |  |
| `maxRequestsPerDay` | `number` | ✅ |  |
| `tierQuotas` | `object` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.
**403**: Forbidden. Admin role required.

---

### Get a single AI feature config 
> **GET** `/api/admin/ai/features/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | AI feature config ID (UUID) |

#### Responses
**200**: AI feature config returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `featureKey` | `string` | ✅ |  |
| `displayName` | `string` | ✅ |  |
| `description` | `string` | ✅ |  |
| `isEnabled` | `boolean` | ✅ |  |
| `maxRequestsPerDay` | `number` | ✅ |  |
| `tierQuotas` | `object` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**404**: Feature not found.

---

### Update AI feature config 
> **PATCH** `/api/admin/ai/features/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | AI feature config ID (UUID) |

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `displayName` | `string` | ❌ |  |
| `description` | `string` | ❌ |  |
| `isEnabled` | `boolean` | ❌ |  |
| `maxRequestsPerDay` | `number` | ❌ | 0 = unlimited |
| `tierQuotas` | `object` | ❌ |  |

#### Responses
**200**: AI feature config updated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `featureKey` | `string` | ✅ |  |
| `displayName` | `string` | ✅ |  |
| `description` | `string` | ✅ |  |
| `isEnabled` | `boolean` | ✅ |  |
| `maxRequestsPerDay` | `number` | ✅ |  |
| `tierQuotas` | `object` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**404**: Feature not found.

---

### Toggle AI feature enabled/disabled 
> **PATCH** `/api/admin/ai/features/{id}/toggle`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | AI feature config ID (UUID) |

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `isEnabled` | `boolean` | ✅ |  |

#### Responses
**200**: AI feature toggled.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `featureKey` | `string` | ✅ |  |
| `displayName` | `string` | ✅ |  |
| `description` | `string` | ✅ |  |
| `isEnabled` | `boolean` | ✅ |  |
| `maxRequestsPerDay` | `number` | ✅ |  |
| `tierQuotas` | `object` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**404**: Feature not found.

---

### Get overall AI usage analytics 
> **GET** `/api/admin/ai/usage`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Overall usage stats returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `totalTokens` | `number` | ✅ |  |
| `totalRequests` | `number` | ✅ |  |
| `totalCost` | `number` | ✅ |  |
| `byFeature` | `Array&lt;FeatureUsageStatDto&gt;` | ✅ |  |
| `byModel` | `Array&lt;ModelUsageStatDto&gt;` | ✅ |  |
| `last7Days` | `Array&lt;DailyUsageStatDto&gt;` | ✅ |  |



---

### Get usage analytics for a specific AI feature 
> **GET** `/api/admin/ai/usage/{featureKey}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `featureKey` | `path` | ✅ | `string` | AI feature key (e.g., cv_generation) |

#### Responses
**200**: Feature usage stats returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `feature` | `string` | ✅ |  |
| `totalTokens` | `number` | ✅ |  |
| `totalRequests` | `number` | ✅ |  |
| `totalCost` | `number` | ✅ |  |
| `todayRequests` | `number` | ✅ |  |
| `last7Days` | `Array&lt;DailyUsageStatDto&gt;` | ✅ |  |
| `topUsers` | `Array&lt;TopUserStatDto&gt;` | ✅ |  |



---

