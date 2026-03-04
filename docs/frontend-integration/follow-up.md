# Integration Guide: follow-up Module

This document provides frontend integration details for the **follow-up** module.

## Endpoints

### Generate a follow-up email draft

> **POST** `/api/follow-up/generate`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field   | Type     | Required | Description                                            |
| ------- | -------- | -------- | ------------------------------------------------------ |
| `jobId` | `string` | ✅       |                                                        |
| `type`  | `string` | ❌       |                                                        |
| `tone`  | `string` | ❌       | Tone of the email (professional, casual, enthusiastic) |

#### Responses

**201**:

| Field           | Type     | Required | Description |
| --------------- | -------- | -------- | ----------- |
| `id`            | `string` | ✅       |             |
| `userId`        | `string` | ✅       |             |
| `user`          | `User`   | ✅       |             |
| `jobId`         | `string` | ✅       |             |
| `job`           | `Job`    | ✅       |             |
| `type`          | `string` | ✅       |             |
| `status`        | `string` | ✅       |             |
| `content`       | `string` | ✅       |             |
| `trackingToken` | `string` | ✅       |             |
| `openedAt`      | `string` | ✅       |             |
| `scheduledAt`   | `string` | ✅       |             |
| `createdAt`     | `string` | ✅       |             |

---

### Update a follow-up draft content

> **PATCH** `/api/follow-up/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Request Body

| Field     | Type     | Required | Description |
| --------- | -------- | -------- | ----------- |
| `content` | `string` | ✅       |             |

#### Responses

**200**:

| Field           | Type     | Required | Description |
| --------------- | -------- | -------- | ----------- |
| `id`            | `string` | ✅       |             |
| `userId`        | `string` | ✅       |             |
| `user`          | `User`   | ✅       |             |
| `jobId`         | `string` | ✅       |             |
| `job`           | `Job`    | ✅       |             |
| `type`          | `string` | ✅       |             |
| `status`        | `string` | ✅       |             |
| `content`       | `string` | ✅       |             |
| `trackingToken` | `string` | ✅       |             |
| `openedAt`      | `string` | ✅       |             |
| `scheduledAt`   | `string` | ✅       |             |
| `createdAt`     | `string` | ✅       |             |

---

### Send or schedule a follow-up email

> **POST** `/api/follow-up/send`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field         | Type     | Required | Description                       |
| ------------- | -------- | -------- | --------------------------------- |
| `followUpId`  | `string` | ✅       |                                   |
| `scheduledAt` | `string` | ❌       | If provided, schedules the email. |

#### Responses

**201**:

| Field           | Type     | Required | Description |
| --------------- | -------- | -------- | ----------- |
| `id`            | `string` | ✅       |             |
| `userId`        | `string` | ✅       |             |
| `user`          | `User`   | ✅       |             |
| `jobId`         | `string` | ✅       |             |
| `job`           | `Job`    | ✅       |             |
| `type`          | `string` | ✅       |             |
| `status`        | `string` | ✅       |             |
| `content`       | `string` | ✅       |             |
| `trackingToken` | `string` | ✅       |             |
| `openedAt`      | `string` | ✅       |             |
| `scheduledAt`   | `string` | ✅       |             |
| `createdAt`     | `string` | ✅       |             |

---

### Track email open

> **GET** `/api/follow-up/track/{token}`

#### Parameters (Path / Query)

| Name    | In     | Required | Type     | Description |
| ------- | ------ | -------- | -------- | ----------- |
| `token` | `path` | ✅       | `string` |             |

#### Responses

**200**:

---
