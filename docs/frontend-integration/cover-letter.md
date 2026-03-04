# Integration Guide: cover-letter Module

This document provides frontend integration details for the **cover-letter** module.

## Endpoints

### Generate a Cover Letter 
> **POST** `/api/cover-letter/generate`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `jobId` | `string` | ✅ |  |
| `tone` | `string` | ❌ | professional | concise | friendly |
| `language` | `string` | ❌ | en | vi |
| `fullName` | `string` | ❌ |  |
| `skills` | `Array&lt;string&gt;` | ❌ |  |
| `experience` | `Array&lt;object&gt;` | ❌ |  |

#### Responses
**201**: Cover letter generated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `jobId` | `string` | ✅ |  |
| `job` | `Job` | ✅ |  |
| `content` | `string` | ✅ |  |
| `tone` | `string` | ✅ |  |
| `language` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.
**403**: AI feature limit reached.

---

### List my cover letters 
> **GET** `/api/cover-letter`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: List of cover letters.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `jobId` | `string` | ✅ |  |
| `job` | `Job` | ✅ |  |
| `content` | `string` | ✅ |  |
| `tone` | `string` | ✅ |  |
| `language` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Get Cover Letter detail 
> **GET** `/api/cover-letter/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Cover Letter ID (UUID) |

#### Responses
**200**: Cover letter detail returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `jobId` | `string` | ✅ |  |
| `job` | `Job` | ✅ |  |
| `content` | `string` | ✅ |  |
| `tone` | `string` | ✅ |  |
| `language` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.
**404**: Cover letter not found.

---

### Update Cover Letter 
> **PATCH** `/api/cover-letter/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Cover Letter ID (UUID) |

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `content` | `string` | ❌ |  |
| `tone` | `string` | ❌ |  |
| `language` | `string` | ❌ |  |

#### Responses
**200**: Cover letter updated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `jobId` | `string` | ✅ |  |
| `job` | `Job` | ✅ |  |
| `content` | `string` | ✅ |  |
| `tone` | `string` | ✅ |  |
| `language` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.
**404**: Cover letter not found.

---

### Delete Cover Letter 
> **DELETE** `/api/cover-letter/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Cover Letter ID (UUID) |

#### Responses
**200**: Cover letter deleted.
**401**: Unauthorized.
**404**: Cover letter not found.

---

