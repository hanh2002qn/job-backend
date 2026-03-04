# Integration Guide: notifications Module

This document provides frontend integration details for the **notifications** module.

## Endpoints

### Get all notifications for current user 
> **GET** `/api/notifications`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: List of notifications returned successfully.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `title` | `string` | ✅ |  |
| `message` | `string` | ✅ |  |
| `type` | `string` | ✅ |  |
| `read` | `boolean` | ✅ |  |
| `link` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Mark a notification as read 
> **PATCH** `/api/notifications/{id}/read`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Notification ID (UUID) |

#### Responses
**200**: Notification marked as read.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `title` | `string` | ✅ |  |
| `message` | `string` | ✅ |  |
| `type` | `string` | ✅ |  |
| `read` | `boolean` | ✅ |  |
| `link` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.
**404**: Notification not found.

---

### Mark all notifications as read 
> **PATCH** `/api/notifications/read-all`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: All notifications marked as read.
**401**: Unauthorized.

---

### Delete a notification 
> **DELETE** `/api/notifications/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Notification ID (UUID) |

#### Responses
**200**: Notification deleted.
**401**: Unauthorized.
**404**: Notification not found.

---

