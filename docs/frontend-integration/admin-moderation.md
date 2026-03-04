# Integration Guide: Admin Moderation Module

This document provides frontend integration details for the **Admin Moderation** module.

## Endpoints

### List jobs for moderation 
> **GET** `/api/admin/moderation/jobs`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `status` | `query` | ❌ | `string` |  |

#### Responses
**200**: Jobs pending moderation returned.

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

### Approve or Reject a job 
> **PATCH** `/api/admin/moderation/jobs/{id}/status`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Job ID (UUID) |

#### Responses
**200**: Job status updated.

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

### Ban or Unban a user 
> **PATCH** `/api/admin/moderation/users/{id}/ban`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | User ID (UUID) |

#### Responses
**200**: User ban status updated.

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


**404**: User not found.

---

