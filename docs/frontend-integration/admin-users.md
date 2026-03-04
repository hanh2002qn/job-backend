# Integration Guide: admin/users Module

This document provides frontend integration details for the **admin/users** module.

## Endpoints

### Get all users

> **GET** `/api/admin/users`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name    | In      | Required | Type     | Description |
| ------- | ------- | -------- | -------- | ----------- |
| `page`  | `query` | ❌       | `number` |             |
| `limit` | `query` | ❌       | `number` |             |

#### Responses

**200**:

---

### Get user detail

> **GET** `/api/admin/users/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**200**:

`Any Object`

---

### Update user role

> **PATCH** `/api/admin/users/{id}/role`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Request Body

| Field  | Type     | Required | Description |
| ------ | -------- | -------- | ----------- |
| `role` | `string` | ✅       |             |

#### Responses

**200**:

---
