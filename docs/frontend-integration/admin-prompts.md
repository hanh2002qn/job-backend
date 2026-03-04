# Integration Guide: Admin Prompts Module

This document provides frontend integration details for the **Admin Prompts** module.

## Endpoints

### Create a new prompt

> **POST** `/api/admin/prompts`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**201**:

| Field         | Type      | Required | Description |
| ------------- | --------- | -------- | ----------- |
| `id`          | `string`  | ✅       |             |
| `key`         | `string`  | ✅       |             |
| `content`     | `string`  | ✅       |             |
| `description` | `string`  | ✅       |             |
| `category`    | `string`  | ✅       |             |
| `isActive`    | `boolean` | ✅       |             |
| `createdAt`   | `string`  | ✅       |             |
| `updatedAt`   | `string`  | ✅       |             |

---

### List all prompts

> **GET** `/api/admin/prompts`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

| Field         | Type      | Required | Description |
| ------------- | --------- | -------- | ----------- |
| `id`          | `string`  | ✅       |             |
| `key`         | `string`  | ✅       |             |
| `content`     | `string`  | ✅       |             |
| `description` | `string`  | ✅       |             |
| `category`    | `string`  | ✅       |             |
| `isActive`    | `boolean` | ✅       |             |
| `createdAt`   | `string`  | ✅       |             |
| `updatedAt`   | `string`  | ✅       |             |

---

### Update a prompt

> **PATCH** `/api/admin/prompts/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**200**:

| Field         | Type      | Required | Description |
| ------------- | --------- | -------- | ----------- |
| `id`          | `string`  | ✅       |             |
| `key`         | `string`  | ✅       |             |
| `content`     | `string`  | ✅       |             |
| `description` | `string`  | ✅       |             |
| `category`    | `string`  | ✅       |             |
| `isActive`    | `boolean` | ✅       |             |
| `createdAt`   | `string`  | ✅       |             |
| `updatedAt`   | `string`  | ✅       |             |

---

### Delete a prompt

> **DELETE** `/api/admin/prompts/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**200**:

---
