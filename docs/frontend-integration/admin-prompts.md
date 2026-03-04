# Integration Guide: Admin Prompts Module

This document provides frontend integration details for the **Admin Prompts** module.

## Endpoints

### Create a new prompt 
> **POST** `/api/admin/prompts`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**201**: Prompt created.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `key` | `string` | ✅ |  |
| `content` | `string` | ✅ |  |
| `description` | `string` | ✅ |  |
| `category` | `string` | ✅ |  |
| `isActive` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |



---

### List all prompts 
> **GET** `/api/admin/prompts`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: List of prompts returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `key` | `string` | ✅ |  |
| `content` | `string` | ✅ |  |
| `description` | `string` | ✅ |  |
| `category` | `string` | ✅ |  |
| `isActive` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |



---

### Update a prompt 
> **PATCH** `/api/admin/prompts/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Prompt ID (UUID) |

#### Responses
**200**: Prompt updated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `key` | `string` | ✅ |  |
| `content` | `string` | ✅ |  |
| `description` | `string` | ✅ |  |
| `category` | `string` | ✅ |  |
| `isActive` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**404**: Prompt not found.

---

### Delete a prompt 
> **DELETE** `/api/admin/prompts/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Prompt ID (UUID) |

#### Responses
**200**: Prompt deleted.
**404**: Prompt not found.

---

