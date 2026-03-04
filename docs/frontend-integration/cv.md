# Integration Guide: cv Module

This document provides frontend integration details for the **cv** module.

## Endpoints

### Generate a CV for a specific job 
> **POST** `/api/cv/generate`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `jobId` | `string` | ✅ |  |
| `template` | `string` | ❌ |  |

#### Responses
**201**: CV generated successfully.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `jobId` | `string` | ✅ |  |
| `job` | `Job` | ✅ |  |
| `name` | `string` | ✅ |  |
| `content` | `object` | ✅ |  |
| `template` | `string` | ✅ |  |
| `score` | `number` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.
**403**: Subscription or AI feature limit reached.

---

### List my generated CVs 
> **GET** `/api/cv`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: List of CVs.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `jobId` | `string` | ✅ |  |
| `job` | `Job` | ✅ |  |
| `name` | `string` | ✅ |  |
| `content` | `object` | ✅ |  |
| `template` | `string` | ✅ |  |
| `score` | `number` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### List available CV templates 
> **GET** `/api/cv/templates`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: List of CV templates.

---

### Get CV detail 
> **GET** `/api/cv/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | CV ID (UUID) |

#### Responses
**200**: CV detail returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `jobId` | `string` | ✅ |  |
| `job` | `Job` | ✅ |  |
| `name` | `string` | ✅ |  |
| `content` | `object` | ✅ |  |
| `template` | `string` | ✅ |  |
| `score` | `number` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.
**404**: CV not found.

---

### Update CV content and name 
> **PATCH** `/api/cv/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | CV ID (UUID) |

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | ❌ | New name for the CV |
| `content` | `object` | ❌ | Updated CV content |
| `template` | `string` | ❌ | Template to use |

#### Responses
**200**: CV updated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `jobId` | `string` | ✅ |  |
| `job` | `Job` | ✅ |  |
| `name` | `string` | ✅ |  |
| `content` | `object` | ✅ |  |
| `template` | `string` | ✅ |  |
| `score` | `number` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.
**404**: CV not found.

---

### Delete a CV 
> **DELETE** `/api/cv/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | CV ID (UUID) |

#### Responses
**200**: CV deleted.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `jobId` | `string` | ✅ |  |
| `job` | `Job` | ✅ |  |
| `name` | `string` | ✅ |  |
| `content` | `object` | ✅ |  |
| `template` | `string` | ✅ |  |
| `score` | `number` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.
**404**: CV not found.

---

### Re-tailor an existing CV for a new job 
> **POST** `/api/cv/{id}/tailor`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | CV ID (UUID) |

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `jobId` | `string` | ✅ | The target job ID to tailor this CV for |

#### Responses
**201**: CV tailored successfully.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `jobId` | `string` | ✅ |  |
| `job` | `Job` | ✅ |  |
| `name` | `string` | ✅ |  |
| `content` | `object` | ✅ |  |
| `template` | `string` | ✅ |  |
| `score` | `number` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.
**404**: CV not found.

---

### Get version history of a CV 
> **GET** `/api/cv/{id}/versions`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | CV ID (UUID) |

#### Responses
**200**: CV versions returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `cvId` | `string` | ✅ |  |
| `cv` | `CV` | ✅ |  |
| `versionNumber` | `number` | ✅ |  |
| `content` | `object` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.
**404**: CV not found.

---

### Restore a previous version 
> **POST** `/api/cv/{id}/versions/{versionId}/restore`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | CV ID (UUID) |
| `versionId` | `path` | ✅ | `string` | Version ID (UUID) |

#### Responses
**201**: Version restored.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `jobId` | `string` | ✅ |  |
| `job` | `Job` | ✅ |  |
| `name` | `string` | ✅ |  |
| `content` | `object` | ✅ |  |
| `template` | `string` | ✅ |  |
| `score` | `number` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.
**404**: CV or version not found.

---

### Get CV HTML for client-side rendering/printing 
> **GET** `/api/cv/{id}/html`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | CV ID (UUID) |

#### Responses
**200**: CV HTML returned.
**401**: Unauthorized.
**404**: CV not found.

---

