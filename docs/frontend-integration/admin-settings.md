# Integration Guide: Admin Settings Module

This document provides frontend integration details for the **Admin Settings** module.

## Endpoints

### List all system settings 
> **GET** `/api/admin/settings`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Settings returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `key` | `string` | ✅ |  |
| `value` | `object` | ✅ |  |
| `description` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |



---

### Get a single system setting 
> **GET** `/api/admin/settings/{key}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `key` | `path` | ✅ | `string` | Setting key |

#### Responses
**200**: Setting returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `key` | `string` | ✅ |  |
| `value` | `object` | ✅ |  |
| `description` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**404**: Setting not found.

---

### Update or create a system setting 
> **PATCH** `/api/admin/settings/{key}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `key` | `path` | ✅ | `string` | Setting key |

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `object` | ❌ |  |
| `description` | `string` | ❌ |  |

#### Responses
**200**: Setting updated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `key` | `string` | ✅ |  |
| `value` | `object` | ✅ |  |
| `description` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |



---

