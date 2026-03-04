# Integration Guide: auth Module

This document provides frontend integration details for the **auth** module.

## Endpoints

### Register a new user

> **POST** `/api/auth/register`

#### Request Body

| Field      | Type     | Required | Description |
| ---------- | -------- | -------- | ----------- |
| `email`    | `string` | ✅       |             |
| `password` | `string` | ✅       |             |

#### Responses

**201**: User successfully registered.
**409**: Email already exists.

---

### Verify email address

> **GET** `/api/auth/verify`

#### Parameters (Path / Query)

| Name    | In      | Required | Type     | Description |
| ------- | ------- | -------- | -------- | ----------- |
| `token` | `query` | ✅       | `string` |             |

#### Responses

**200**:

---

### Login user

> **POST** `/api/auth/login`

#### Request Body

| Field      | Type     | Required | Description |
| ---------- | -------- | -------- | ----------- |
| `email`    | `string` | ✅       |             |
| `password` | `string` | ✅       |             |

#### Responses

**200**: Login successful.
**401**: Invalid credentials.

---

### Logout user

> **POST** `/api/auth/logout`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

---

### Refresh access token

> **POST** `/api/auth/refresh`

#### Request Body

| Field          | Type     | Required | Description |
| -------------- | -------- | -------- | ----------- |
| `refreshToken` | `string` | ✅       |             |

#### Responses

**200**:

---

### Change password

> **POST** `/api/auth/change-password`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field         | Type     | Required | Description |
| ------------- | -------- | -------- | ----------- |
| `oldPassword` | `string` | ✅       |             |
| `newPassword` | `string` | ✅       |             |

#### Responses

**200**:

---

### Request password reset

> **POST** `/api/auth/forgot-password`

#### Request Body

| Field   | Type     | Required | Description |
| ------- | -------- | -------- | ----------- |
| `email` | `string` | ✅       |             |

#### Responses

**200**:

---

### Reset password using token

> **POST** `/api/auth/reset-password`

#### Request Body

| Field         | Type     | Required | Description |
| ------------- | -------- | -------- | ----------- |
| `newPassword` | `string` | ✅       |             |
| `token`       | `string` | ✅       |             |

#### Responses

**200**:

---

### Initiate Google OAuth login

> **GET** `/api/auth/google`

#### Responses

**200**:

---

### Google OAuth callback

> **GET** `/api/auth/google/callback`

#### Responses

**200**:

---

### Initiate GitHub OAuth login

> **GET** `/api/auth/github`

#### Responses

**200**:

---

### GitHub OAuth callback

> **GET** `/api/auth/github/callback`

#### Responses

**200**:

---

### Initiate Apple OAuth login

> **POST** `/api/auth/apple`

#### Responses

**201**:

---

### Apple OAuth callback

> **POST** `/api/auth/apple/callback`

#### Responses

**201**:

---
