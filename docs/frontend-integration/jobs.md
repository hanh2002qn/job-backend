# Integration Guide: jobs Module

This document provides frontend integration details for the **jobs** module.

## Endpoints

### Search jobs with full-text search

> **GET** `/api/jobs/search`

#### Parameters (Path / Query)

| Name              | In      | Required | Type     | Description |
| ----------------- | ------- | -------- | -------- | ----------- |
| `page`            | `query` | ❌       | `number` |             |
| `limit`           | `query` | ❌       | `number` |             |
| `sortOrder`       | `query` | ❌       | `string` |             |
| `keyword`         | `query` | ❌       | `string` |             |
| `location`        | `query` | ❌       | `string` |             |
| `city`            | `query` | ❌       | `string` |             |
| `experienceLevel` | `query` | ❌       | `string` |             |
| `level`           | `query` | ❌       | `string` |             |
| `source`          | `query` | ❌       | `string` |             |
| `industry`        | `query` | ❌       | `string` |             |
| `category`        | `query` | ❌       | `string` |             |
| `minSalary`       | `query` | ❌       | `number` |             |
| `maxSalary`       | `query` | ❌       | `number` |             |
| `jobType`         | `query` | ❌       | `string` |             |
| `sortBy`          | `query` | ❌       | `string` |             |

#### Responses

**200**:

---

### Get saved/bookmarked jobs

> **GET** `/api/jobs/saved`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name    | In      | Required | Type     | Description |
| ------- | ------- | -------- | -------- | ----------- |
| `page`  | `query` | ❌       | `number` |             |
| `limit` | `query` | ❌       | `number` |             |

#### Responses

**200**:

---

### Get job detail

> **GET** `/api/jobs/{id}`

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**200**:

`Any Object`

---

### Save/Bookmark a job

> **POST** `/api/jobs/{id}/save`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**201**:

| Field     | Type     | Required | Description |
| --------- | -------- | -------- | ----------- |
| `id`      | `string` | ✅       |             |
| `userId`  | `string` | ✅       |             |
| `jobId`   | `string` | ✅       |             |
| `user`    | `User`   | ✅       |             |
| `job`     | `Job`    | ✅       |             |
| `savedAt` | `string` | ✅       |             |

---

### Unsave/Remove bookmark from job

> **DELETE** `/api/jobs/{id}/save`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**204**:

---
