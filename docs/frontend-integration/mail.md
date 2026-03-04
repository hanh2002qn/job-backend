# Integration Guide: mail Module

This document provides frontend integration details for the **mail** module.

## Endpoints

### Get current email notification preferences 
> **GET** `/api/mail/preferences`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Email preferences returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `jobAlerts` | `boolean` | ✅ |  |
| `applicationReminders` | `boolean` | ✅ |  |
| `marketing` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Update email notification preferences 
> **PATCH** `/api/mail/preferences`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `jobAlerts` | `boolean` | ❌ | Receive job alert emails |
| `applicationReminders` | `boolean` | ❌ | Receive application reminders |
| `marketing` | `boolean` | ❌ | Receive marketing and tip emails |

#### Responses
**200**: Email preferences updated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `jobAlerts` | `boolean` | ✅ |  |
| `applicationReminders` | `boolean` | ✅ |  |
| `marketing` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

