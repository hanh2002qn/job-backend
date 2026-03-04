# Integration Guide: jobs Module

This document provides frontend integration details for the **jobs** module.

## Endpoints

### Search jobs with full-text search 
> **GET** `/api/jobs/search`

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

### Get saved/bookmarked jobs 
> **GET** `/api/jobs/saved`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `page` | `query` | ❌ | `number` |  |
| `limit` | `query` | ❌ | `number` |  |

#### Responses
**200**: Paginated list of saved jobs.
**401**: Unauthorized.

---

### Get job detail 
> **GET** `/api/jobs/{id}`

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Job ID (UUID) |

#### Responses
**200**: Job detail returned.

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


**404**: Job not found.

---

### Save/Bookmark a job 
> **POST** `/api/jobs/{id}/save`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Job ID (UUID) |

#### Responses
**201**: Job saved.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `jobId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `job` | `Job` | ✅ |  |
| `savedAt` | `string` | ✅ |  |


**401**: Unauthorized.
**404**: Job not found.

---

### Unsave/Remove bookmark from job 
> **DELETE** `/api/jobs/{id}/save`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Job ID (UUID) |

#### Responses
**204**: Job unsaved.
**401**: Unauthorized.
**404**: Saved job not found.

---

