# Integration Guide: admin/jobs Module

This document provides frontend integration details for the **admin/jobs** module.

## Endpoints

### Get all jobs (with filters) 
> **GET** `/api/admin/jobs`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `page` | `query` | ❌ | `number` |  |
| `limit` | `query` | ❌ | `number` |  |
| `sortOrder` | `query` | ❌ | `string` |  |
| `keyword` | `query` | ❌ | `string` |  |
| `location` | `query` | ❌ | `string` |  |
| `city` | `query` | ❌ | `string` |  |
| `experienceLevel` | `query` | ❌ | `string` |  |
| `level` | `query` | ❌ | `string` |  |
| `source` | `query` | ❌ | `string` |  |
| `industry` | `query` | ❌ | `string` |  |
| `category` | `query` | ❌ | `string` |  |
| `minSalary` | `query` | ❌ | `number` |  |
| `maxSalary` | `query` | ❌ | `number` |  |
| `jobType` | `query` | ❌ | `string` |  |
| `sortBy` | `query` | ❌ | `string` |  |

#### Responses
**200**: Paginated list of jobs.

---

### Create new job 
> **POST** `/api/admin/jobs`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**201**: Job created.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `source` | `string` | ✅ |  |
| `title` | `string` | ✅ |  |
| `company` | `string` | ✅ |  |
| `location` | `string` | ✅ |  |
| `logoUrl` | `string` | ✅ |  |
| `companyAddress` | `string` | ✅ |  |
| `companySize` | `string` | ✅ |  |
| `workingTime` | `string` | ✅ |  |
| `companyType` | `string` | ✅ |  |
| `salaryMin` | `number` | ✅ |  |
| `salaryMax` | `number` | ✅ |  |
| `currency` | `string` | ✅ |  |
| `jobType` | `string` | ✅ |  |
| `experienceLevel` | `string` | ✅ |  |
| `level` | `string` | ✅ |  |
| `category` | `string` | ✅ |  |
| `categories` | `Array&lt;string&gt;` | ✅ |  |
| `education` | `string` | ✅ |  |
| `city` | `string` | ✅ |  |
| `isBranded` | `boolean` | ✅ |  |
| `tags` | `Array&lt;string&gt;` | ✅ |  |
| `quantity` | `number` | ✅ |  |
| `gender` | `string` | ✅ |  |
| `deadline` | `string` | ✅ |  |
| `allowance` | `string` | ✅ |  |
| `equipment` | `string` | ✅ |  |
| `industry` | `string` | ✅ |  |
| `salary` | `string` | ✅ |  |
| `description` | `string` | ✅ |  |
| `requirements` | `string` | ✅ |  |
| `benefits` | `string` | ✅ |  |
| `skills` | `Array&lt;string&gt;` | ✅ |  |
| `originalData` | `object` | ✅ |  |
| `expired` | `boolean` | ✅ |  |
| `externalId` | `string` | ✅ |  |
| `url` | `string` | ✅ |  |
| `postedAt` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `isVerified` | `boolean` | ✅ |  |
| `isAlertSent` | `boolean` | ✅ |  |
| `status` | `string` | ✅ |  |
| `searchVector` | `string` | ✅ |  |
| `expiresAt` | `string` | ✅ |  |
| `contentHash` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |



---

### Update job 
> **PATCH** `/api/admin/jobs/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Job ID (UUID) |

#### Responses
**200**: Job updated.
**404**: Job not found.

---

### Delete job 
> **DELETE** `/api/admin/jobs/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Job ID (UUID) |

#### Responses
**200**: Job deleted.
**404**: Job not found.

---

