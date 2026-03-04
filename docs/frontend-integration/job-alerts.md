# Integration Guide: job-alerts Module

This document provides frontend integration details for the **job-alerts** module.

## Endpoints

### Get my job alert settings 
> **GET** `/api/job-alerts/me`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Job alert settings returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `isActive` | `boolean` | ✅ |  |
| `frequency` | `string` | ✅ |  |
| `channels` | `Array&lt;string&gt;` | ✅ |  |
| `lastSentAt` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Update my job alert settings 
> **PATCH** `/api/job-alerts/me`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `isActive` | `boolean` | ❌ |  |
| `frequency` | `string` | ❌ |  |
| `channels` | `Array&lt;string&gt;` | ❌ |  |

#### Responses
**200**: Job alert settings updated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `isActive` | `boolean` | ✅ |  |
| `frequency` | `string` | ✅ |  |
| `channels` | `Array&lt;string&gt;` | ✅ |  |
| `lastSentAt` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

