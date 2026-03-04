# Integration Guide: Admin Support Module

This document provides frontend integration details for the **Admin Support** module.

## Endpoints

### Impersonate a user (get access token)

> **POST** `/api/admin/support/users/{id}/impersonate`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**201**:

---
