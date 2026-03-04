# Integration Guide: matching Module

This document provides frontend integration details for the **matching** module.

## Endpoints

### Get jobs matched to user profile (rule-based)

> **GET** `/api/matching/jobs`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

---

### Get AI-powered job recommendations based on profile

> **GET** `/api/matching/ai-recommendations`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

`Any Object`

---

### Get personalized job feed (AI + Rule-based)

> **GET** `/api/matching/feed`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

---

### Get detailed AI semantic matching analysis

> **GET** `/api/matching/job/{jobId}/semantic`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name    | In     | Required | Type     | Description |
| ------- | ------ | -------- | -------- | ----------- |
| `jobId` | `path` | ✅       | `string` |             |

#### Responses

**200**:

`Any Object`

---

### Get detailed rule-based matching analysis

> **GET** `/api/matching/job/{jobId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name    | In     | Required | Type     | Description |
| ------- | ------ | -------- | -------- | ----------- |
| `jobId` | `path` | ✅       | `string` |             |

#### Responses

**200**:

---
