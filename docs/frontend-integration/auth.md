# Integration Guide: auth Module

This document provides frontend integration details for the **auth** module.

## Endpoints

### Register a new user 
> **POST** `/api/auth/register`

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | `string` | ✅ |  |
| `password` | `string` | ✅ |  |

#### Responses
**201**: User successfully registered.
**409**: Email already exists.

---

### Verify email address 
> **GET** `/api/auth/verify`

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `token` | `query` | ✅ | `string` | Email verification token |

#### Responses
**200**: Email verified successfully.
**400**: Invalid or expired token.

---

### Login user 
> **POST** `/api/auth/login`

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | `string` | ✅ |  |
| `password` | `string` | ✅ |  |

#### Responses
**200**: Login successful.
**401**: Invalid credentials.

---

### Logout user 
> **POST** `/api/auth/logout`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Logout successful.
**401**: Unauthorized.

---

### Refresh access token 
> **POST** `/api/auth/refresh`

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `refreshToken` | `string` | ✅ |  |

#### Responses
**200**: Tokens refreshed successfully.
**401**: Invalid or expired refresh token.

---

### Change password 
> **POST** `/api/auth/change-password`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `oldPassword` | `string` | ✅ |  |
| `newPassword` | `string` | ✅ |  |

#### Responses
**200**: Password changed successfully.
**400**: Current password is incorrect.
**401**: Unauthorized.

---

### Request password reset 
> **POST** `/api/auth/forgot-password`

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | `string` | ✅ |  |

#### Responses
**200**: Password reset email sent.
**429**: Too many requests.

---

### Reset password using token 
> **POST** `/api/auth/reset-password`

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `newPassword` | `string` | ✅ |  |
| `token` | `string` | ✅ |  |

#### Responses
**200**: Password reset successfully.
**400**: Invalid or expired reset token.
**429**: Too many requests.

---

### Initiate Google OAuth login 
> **GET** `/api/auth/google`

#### Responses
**200**: 
**302**: Redirects to Google OAuth consent screen.

---

### Initiate GitHub OAuth login 
> **GET** `/api/auth/github`

#### Responses
**200**: 
**302**: Redirects to GitHub OAuth consent screen.

---

### Initiate Apple OAuth login 
> **POST** `/api/auth/apple`

#### Responses
**201**: 
**302**: Redirects to Apple OAuth consent screen.

---

