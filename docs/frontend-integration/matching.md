# Integration Guide: matching Module

This document provides frontend integration details for the **matching** module.

## Endpoints

### Get jobs matched to user profile (rule-based) 
> **GET** `/api/matching/jobs`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Matched jobs returned.
**401**: Unauthorized.

---

### Get AI-powered job recommendations based on profile 
> **GET** `/api/matching/ai-recommendations`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: AI recommendations returned.
**401**: Unauthorized.

---

### Get personalized job feed (AI + Rule-based) 
> **GET** `/api/matching/feed`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Personalized job feed returned.
**401**: Unauthorized.

---

### Get detailed AI semantic matching analysis 
> **GET** `/api/matching/job/{jobId}/semantic`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `jobId` | `path` | ✅ | `string` | Job ID (UUID) |

#### Responses
**200**: Semantic match analysis returned.
**401**: Unauthorized.

---

### Get detailed rule-based matching analysis 
> **GET** `/api/matching/job/{jobId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `jobId` | `path` | ✅ | `string` | Job ID (UUID) |

#### Responses
**200**: Rule-based match analysis returned.
**401**: Unauthorized.

---

