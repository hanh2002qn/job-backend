# Integration Guide: follow-up Module

This document provides frontend integration details for the **follow-up** module.

## Endpoints

### Generate a follow-up email draft 
> **POST** `/api/follow-up/generate`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `jobId` | `string` | ✅ |  |
| `type` | `string` | ❌ |  |
| `tone` | `string` | ❌ | Tone of the email (professional, casual, enthusiastic) |

#### Responses
**201**: Follow-up email generated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `jobId` | `string` | ✅ |  |
| `job` | `Job` | ✅ |  |
| `type` | `string` | ✅ |  |
| `status` | `string` | ✅ |  |
| `content` | `string` | ✅ |  |
| `trackingToken` | `string` | ✅ |  |
| `openedAt` | `string` | ✅ |  |
| `scheduledAt` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.
**429**: Rate limit exceeded.

---

### Update a follow-up draft content 
> **PATCH** `/api/follow-up/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Follow-up ID (UUID) |

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `content` | `string` | ✅ |  |

#### Responses
**200**: Follow-up updated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `jobId` | `string` | ✅ |  |
| `job` | `Job` | ✅ |  |
| `type` | `string` | ✅ |  |
| `status` | `string` | ✅ |  |
| `content` | `string` | ✅ |  |
| `trackingToken` | `string` | ✅ |  |
| `openedAt` | `string` | ✅ |  |
| `scheduledAt` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.
**404**: Follow-up not found.

---

### Send or schedule a follow-up email 
> **POST** `/api/follow-up/send`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `followUpId` | `string` | ✅ |  |
| `scheduledAt` | `string` | ❌ | If provided, schedules the email. |

#### Responses
**201**: Follow-up sent or scheduled.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `jobId` | `string` | ✅ |  |
| `job` | `Job` | ✅ |  |
| `type` | `string` | ✅ |  |
| `status` | `string` | ✅ |  |
| `content` | `string` | ✅ |  |
| `trackingToken` | `string` | ✅ |  |
| `openedAt` | `string` | ✅ |  |
| `scheduledAt` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Track email open 
> **GET** `/api/follow-up/track/{token}`

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `token` | `path` | ✅ | `string` | Tracking token |

#### Responses
**200**: 1x1 transparent pixel returned.

---

