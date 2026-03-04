# Integration Guide: cv Module

This document provides frontend integration details for the **cv** module.

## Endpoints

### Generate a CV for a specific job

> **POST** `/api/cv/generate`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field      | Type     | Required | Description |
| ---------- | -------- | -------- | ----------- |
| `jobId`    | `string` | ✅       |             |
| `template` | `string` | ❌       |             |

#### Responses

**201**:

| Field       | Type     | Required | Description |
| ----------- | -------- | -------- | ----------- |
| `id`        | `string` | ✅       |             |
| `userId`    | `string` | ✅       |             |
| `user`      | `User`   | ✅       |             |
| `jobId`     | `string` | ✅       |             |
| `job`       | `Job`    | ✅       |             |
| `name`      | `string` | ✅       |             |
| `content`   | `object` | ✅       |             |
| `template`  | `string` | ✅       |             |
| `score`     | `number` | ✅       |             |
| `createdAt` | `string` | ✅       |             |

---

### List my generated CVs

> **GET** `/api/cv`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

| Field       | Type     | Required | Description |
| ----------- | -------- | -------- | ----------- |
| `id`        | `string` | ✅       |             |
| `userId`    | `string` | ✅       |             |
| `user`      | `User`   | ✅       |             |
| `jobId`     | `string` | ✅       |             |
| `job`       | `Job`    | ✅       |             |
| `name`      | `string` | ✅       |             |
| `content`   | `object` | ✅       |             |
| `template`  | `string` | ✅       |             |
| `score`     | `number` | ✅       |             |
| `createdAt` | `string` | ✅       |             |

---

### List available CV templates

> **GET** `/api/cv/templates`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

---

### Get CV detail

> **GET** `/api/cv/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**200**:

| Field       | Type     | Required | Description |
| ----------- | -------- | -------- | ----------- |
| `id`        | `string` | ✅       |             |
| `userId`    | `string` | ✅       |             |
| `user`      | `User`   | ✅       |             |
| `jobId`     | `string` | ✅       |             |
| `job`       | `Job`    | ✅       |             |
| `name`      | `string` | ✅       |             |
| `content`   | `object` | ✅       |             |
| `template`  | `string` | ✅       |             |
| `score`     | `number` | ✅       |             |
| `createdAt` | `string` | ✅       |             |

---

### Update CV content and name

> **PATCH** `/api/cv/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Request Body

| Field      | Type     | Required | Description         |
| ---------- | -------- | -------- | ------------------- |
| `name`     | `string` | ❌       | New name for the CV |
| `content`  | `object` | ❌       | Updated CV content  |
| `template` | `string` | ❌       | Template to use     |

#### Responses

**200**:

| Field       | Type     | Required | Description |
| ----------- | -------- | -------- | ----------- |
| `id`        | `string` | ✅       |             |
| `userId`    | `string` | ✅       |             |
| `user`      | `User`   | ✅       |             |
| `jobId`     | `string` | ✅       |             |
| `job`       | `Job`    | ✅       |             |
| `name`      | `string` | ✅       |             |
| `content`   | `object` | ✅       |             |
| `template`  | `string` | ✅       |             |
| `score`     | `number` | ✅       |             |
| `createdAt` | `string` | ✅       |             |

---

### Delete a CV

> **DELETE** `/api/cv/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**200**:

| Field       | Type     | Required | Description |
| ----------- | -------- | -------- | ----------- |
| `id`        | `string` | ✅       |             |
| `userId`    | `string` | ✅       |             |
| `user`      | `User`   | ✅       |             |
| `jobId`     | `string` | ✅       |             |
| `job`       | `Job`    | ✅       |             |
| `name`      | `string` | ✅       |             |
| `content`   | `object` | ✅       |             |
| `template`  | `string` | ✅       |             |
| `score`     | `number` | ✅       |             |
| `createdAt` | `string` | ✅       |             |

---

### Re-tailor an existing CV for a new job

> **POST** `/api/cv/{id}/tailor`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Request Body

| Field   | Type     | Required | Description                             |
| ------- | -------- | -------- | --------------------------------------- |
| `jobId` | `string` | ✅       | The target job ID to tailor this CV for |

#### Responses

**201**:

| Field       | Type     | Required | Description |
| ----------- | -------- | -------- | ----------- |
| `id`        | `string` | ✅       |             |
| `userId`    | `string` | ✅       |             |
| `user`      | `User`   | ✅       |             |
| `jobId`     | `string` | ✅       |             |
| `job`       | `Job`    | ✅       |             |
| `name`      | `string` | ✅       |             |
| `content`   | `object` | ✅       |             |
| `template`  | `string` | ✅       |             |
| `score`     | `number` | ✅       |             |
| `createdAt` | `string` | ✅       |             |

---

### Get version history of a CV

> **GET** `/api/cv/{id}/versions`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**200**:

| Field           | Type     | Required | Description |
| --------------- | -------- | -------- | ----------- |
| `id`            | `string` | ✅       |             |
| `cvId`          | `string` | ✅       |             |
| `cv`            | `CV`     | ✅       |             |
| `versionNumber` | `number` | ✅       |             |
| `content`       | `object` | ✅       |             |
| `createdAt`     | `string` | ✅       |             |

---

### Restore a previous version

> **POST** `/api/cv/{id}/versions/{versionId}/restore`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name        | In     | Required | Type     | Description |
| ----------- | ------ | -------- | -------- | ----------- |
| `id`        | `path` | ✅       | `string` |             |
| `versionId` | `path` | ✅       | `string` |             |

#### Responses

**201**:

| Field       | Type     | Required | Description |
| ----------- | -------- | -------- | ----------- |
| `id`        | `string` | ✅       |             |
| `userId`    | `string` | ✅       |             |
| `user`      | `User`   | ✅       |             |
| `jobId`     | `string` | ✅       |             |
| `job`       | `Job`    | ✅       |             |
| `name`      | `string` | ✅       |             |
| `content`   | `object` | ✅       |             |
| `template`  | `string` | ✅       |             |
| `score`     | `number` | ✅       |             |
| `createdAt` | `string` | ✅       |             |

---

### Get CV HTML for client-side rendering/printing

> **GET** `/api/cv/{id}/html`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**200**:

---
