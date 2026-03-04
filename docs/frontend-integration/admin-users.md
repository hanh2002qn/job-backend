# Integration Guide: admin/users Module

This document provides frontend integration details for the **admin/users** module.

## Endpoints

### Get all users 
> **GET** `/api/admin/users`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `page` | `query` | ❌ | `number` |  |
| `limit` | `query` | ❌ | `number` |  |

#### Responses
**200**: Paginated list of users.
**401**: Unauthorized.
**403**: Forbidden. Admin role required.

---

### Get user detail 
> **GET** `/api/admin/users/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | User ID (UUID) |

#### Responses
**200**: User detail returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `email` | `string` | ✅ |  |
| `passwordHash` | `string` | ✅ |  |
| `isVerified` | `boolean` | ✅ |  |
| `isBanned` | `boolean` | ✅ |  |
| `verificationToken` | `string` | ✅ |  |
| `resetPasswordToken` | `string` | ✅ |  |
| `resetPasswordExpires` | `string` | ✅ |  |
| `role` | `string` | ✅ |  |
| `googleId` | `string` | ✅ |  |
| `githubId` | `string` | ✅ |  |
| `appleId` | `string` | ✅ |  |
| `avatarUrl` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `trackers` | `Array&lt;JobTracker&gt;` | ✅ |  |
| `cvs` | `Array&lt;CV&gt;` | ✅ |  |
| `refreshTokens` | `Array&lt;RefreshToken&gt;` | ✅ |  |
| `coverLetters` | `Array&lt;CoverLetter&gt;` | ✅ |  |
| `jobAlert` | `JobAlert` | ✅ |  |
| `credits` | `UserCredits` | ✅ |  |


**401**: Unauthorized.
**403**: Forbidden. Admin role required.
**404**: User not found.

---

### Update user role 
> **PATCH** `/api/admin/users/{id}/role`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | User ID (UUID) |

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `role` | `string` | ✅ |  |

#### Responses
**200**: User role updated.
**401**: Unauthorized.
**403**: Forbidden. Admin role required.
**404**: User not found.

---

