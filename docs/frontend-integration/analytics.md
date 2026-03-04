# Integration Guide: analytics Module

This document provides frontend integration details for the **analytics** module.

## Endpoints

### Get application analytics overview 
> **GET** `/api/analytics/overview`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `period` | `query` | ❌ | `string` | Timeline period (default: 7d) |

#### Responses
**200**: Analytics overview returned.
**401**: Unauthorized.

---

