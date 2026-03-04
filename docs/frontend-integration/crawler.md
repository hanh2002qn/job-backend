# Integration Guide: Crawler Module

This document provides frontend integration details for the **Crawler** module.

## Endpoints

### Get crawler health status (Admin only)

> **GET** `/api/crawler/health`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

---

### Get all crawler configurations (Admin only)

> **GET** `/api/crawler/configs`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

| Field       | Type      | Required | Description |
| ----------- | --------- | -------- | ----------- |
| `id`        | `string`  | ✅       |             |
| `source`    | `string`  | ✅       |             |
| `isActive`  | `boolean` | ✅       |             |
| `config`    | `object`  | ✅       |             |
| `updatedAt` | `string`  | ✅       |             |

---

### Update a specific crawler configuration (Admin only)

> **PATCH** `/api/crawler/configs/{source}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name     | In     | Required | Type     | Description |
| -------- | ------ | -------- | -------- | ----------- |
| `source` | `path` | ✅       | `string` |             |

#### Request Body

| Field      | Type      | Required | Description                                     |
| ---------- | --------- | -------- | ----------------------------------------------- |
| `isActive` | `boolean` | ❌       | Whether the crawler is currently active         |
| `config`   | `object`  | ❌       | Specific configuration for this crawler as JSON |

#### Responses

**200**:

| Field       | Type      | Required | Description |
| ----------- | --------- | -------- | ----------- |
| `id`        | `string`  | ✅       |             |
| `source`    | `string`  | ✅       |             |
| `isActive`  | `boolean` | ✅       |             |
| `config`    | `object`  | ✅       |             |
| `updatedAt` | `string`  | ✅       |             |

---

### Trigger job crawler manually (Admin only)

> **POST** `/api/crawler/trigger`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**201**:

---

### Test crawler with specific URL

> **POST** `/api/crawler/test`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**201**:

---
