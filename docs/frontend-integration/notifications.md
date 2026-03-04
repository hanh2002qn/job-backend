# Integration Guide: Notifications Module

This document provides frontend integration details for the **Notifications** module.

## Endpoints

### Endpoint

> **GET** `/api/notifications`

#### Responses

**200**:

| Field       | Type      | Required | Description |
| ----------- | --------- | -------- | ----------- |
| `id`        | `string`  | ✅       |             |
| `userId`    | `string`  | ✅       |             |
| `user`      | `User`    | ✅       |             |
| `title`     | `string`  | ✅       |             |
| `message`   | `string`  | ✅       |             |
| `type`      | `string`  | ✅       |             |
| `read`      | `boolean` | ✅       |             |
| `link`      | `string`  | ✅       |             |
| `createdAt` | `string`  | ✅       |             |

---

### Endpoint

> **PATCH** `/api/notifications/{id}/read`

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**200**:

| Field       | Type      | Required | Description |
| ----------- | --------- | -------- | ----------- |
| `id`        | `string`  | ✅       |             |
| `userId`    | `string`  | ✅       |             |
| `user`      | `User`    | ✅       |             |
| `title`     | `string`  | ✅       |             |
| `message`   | `string`  | ✅       |             |
| `type`      | `string`  | ✅       |             |
| `read`      | `boolean` | ✅       |             |
| `link`      | `string`  | ✅       |             |
| `createdAt` | `string`  | ✅       |             |

---

### Endpoint

> **PATCH** `/api/notifications/read-all`

#### Responses

**200**:

---

### Endpoint

> **DELETE** `/api/notifications/{id}`

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**200**:

---
