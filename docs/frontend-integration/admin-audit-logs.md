# Integration Guide: admin/audit-logs Module

This document provides frontend integration details for the **admin/audit-logs** module.

## Endpoints

### Get all audit logs with filtering and pagination 
> **GET** `/api/admin/audit-logs`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `status` | `query` | ❌ | `any` | Filter by status |
| `module` | `query` | ❌ | `any` | Filter by module name |
| `action` | `query` | ❌ | `any` | Filter by action name |
| `userId` | `query` | ❌ | `any` | Filter by user ID |
| `limit` | `query` | ❌ | `number` | Items per page |
| `page` | `query` | ❌ | `number` | Page number |

#### Responses
**200**: Audit logs returned successfully.
**401**: Unauthorized.
**403**: Forbidden. Admin role required.

---

