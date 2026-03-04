# Integration Guide: profiles Module

This document provides frontend integration details for the **profiles** module.

## Endpoints

### Get current user profile with completeness score 
> **GET** `/api/profiles/me`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Profile returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `fullName` | `string` | ✅ |  |
| `phone` | `string` | ✅ |  |
| `address` | `string` | ✅ |  |
| `currentRole` | `string` | ✅ |  |
| `seniorityLevel` | `string` | ✅ |  |
| `yearsOfExperience` | `number` | ✅ |  |
| `location` | `string` | ✅ |  |
| `workPreference` | `string` | ✅ |  |
| `source` | `string` | ✅ |  |
| `confidence` | `number` | ✅ |  |
| `linkedin` | `string` | ✅ |  |
| `portfolio` | `string` | ✅ |  |
| `cvUrl` | `string` | ✅ |  |
| `cvFileName` | `string` | ✅ |  |
| `cvS3Key` | `string` | ✅ |  |
| `isPublic` | `boolean` | ✅ |  |
| `visibilitySettings` | `object` | ✅ |  |
| `profileSkills` | `Array&lt;ProfileSkill&gt;` | ✅ |  |
| `profileExperiences` | `Array&lt;ProfileExperience&gt;` | ✅ |  |
| `profileProjects` | `Array&lt;ProfileProject&gt;` | ✅ |  |
| `careerIntent` | `CareerIntent` | ✅ |  |
| `workPreferences` | `WorkPreferences` | ✅ |  |
| `cvImportSessions` | `Array&lt;CvImportSession&gt;` | ✅ |  |
| `metadata` | `ProfileMetadata` | ✅ |  |
| `insights` | `Array&lt;ProfileInsight&gt;` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |
| `skills` | `Array&lt;string&gt;` | ✅ |  |
| `experience` | `Array&lt;object&gt;` | ✅ |  |
| `education` | `Array&lt;object&gt;` | ✅ |  |
| `preferredIndustries` | `Array&lt;string&gt;` | ✅ |  |
| `preferredJobTypes` | `Array&lt;string&gt;` | ✅ |  |
| `preferredLocations` | `Array&lt;string&gt;` | ✅ |  |
| `minSalaryExpectation` | `number` | ✅ |  |
| `completenessScore` | `number` | ✅ |  |


**401**: Unauthorized.

---

### Update current user profile 
> **PUT** `/api/profiles/me`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `fullName` | `string` | ❌ | Full name |
| `phone` | `string` | ❌ | Phone number |
| `address` | `string` | ❌ | Address |
| `currentRole` | `string` | ❌ | Current job role |
| `seniorityLevel` | `string` | ❌ | Seniority level |
| `yearsOfExperience` | `number` | ❌ | Years of experience |
| `location` | `string` | ❌ | Current location |
| `workPreference` | `string` | ❌ | Preferred work mode |
| `linkedin` | `string` | ❌ | LinkedIn profile URL |
| `portfolio` | `string` | ❌ | Portfolio website URL |

#### Responses
**200**: Profile updated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `fullName` | `string` | ✅ |  |
| `phone` | `string` | ✅ |  |
| `address` | `string` | ✅ |  |
| `currentRole` | `string` | ✅ |  |
| `seniorityLevel` | `string` | ✅ |  |
| `yearsOfExperience` | `number` | ✅ |  |
| `location` | `string` | ✅ |  |
| `workPreference` | `string` | ✅ |  |
| `source` | `string` | ✅ |  |
| `confidence` | `number` | ✅ |  |
| `linkedin` | `string` | ✅ |  |
| `portfolio` | `string` | ✅ |  |
| `cvUrl` | `string` | ✅ |  |
| `cvFileName` | `string` | ✅ |  |
| `cvS3Key` | `string` | ✅ |  |
| `isPublic` | `boolean` | ✅ |  |
| `visibilitySettings` | `object` | ✅ |  |
| `profileSkills` | `Array&lt;ProfileSkill&gt;` | ✅ |  |
| `profileExperiences` | `Array&lt;ProfileExperience&gt;` | ✅ |  |
| `profileProjects` | `Array&lt;ProfileProject&gt;` | ✅ |  |
| `careerIntent` | `CareerIntent` | ✅ |  |
| `workPreferences` | `WorkPreferences` | ✅ |  |
| `cvImportSessions` | `Array&lt;CvImportSession&gt;` | ✅ |  |
| `metadata` | `ProfileMetadata` | ✅ |  |
| `insights` | `Array&lt;ProfileInsight&gt;` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |
| `skills` | `Array&lt;string&gt;` | ✅ |  |
| `experience` | `Array&lt;object&gt;` | ✅ |  |
| `education` | `Array&lt;object&gt;` | ✅ |  |
| `preferredIndustries` | `Array&lt;string&gt;` | ✅ |  |
| `preferredJobTypes` | `Array&lt;string&gt;` | ✅ |  |
| `preferredLocations` | `Array&lt;string&gt;` | ✅ |  |
| `minSalaryExpectation` | `number` | ✅ |  |
| `completenessScore` | `number` | ✅ |  |


**401**: Unauthorized.

---

### Upload CV and auto-populate profile with AI parsing 
> **POST** `/api/profiles/me/cv`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
**Content-Type**: `multipart/form-data`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `file` | `string` | ❌ |  |

#### Responses
**201**: CV uploaded and parsed.
**401**: Unauthorized.

---

### Upload profile avatar 
> **POST** `/api/profiles/me/avatar`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
**Content-Type**: `multipart/form-data`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `file` | `string` | ❌ |  |

#### Responses
**201**: Avatar uploaded.
**401**: Unauthorized.

---

### Update profile visibility settings 
> **PUT** `/api/profiles/me/visibility`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `isPublic` | `boolean` | ❌ | Make profile public/private |
| `visibilitySettings` | `VisibilitySettingsDto` | ❌ |  |

#### Responses
**200**: Visibility settings updated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `userId` | `string` | ✅ |  |
| `user` | `User` | ✅ |  |
| `fullName` | `string` | ✅ |  |
| `phone` | `string` | ✅ |  |
| `address` | `string` | ✅ |  |
| `currentRole` | `string` | ✅ |  |
| `seniorityLevel` | `string` | ✅ |  |
| `yearsOfExperience` | `number` | ✅ |  |
| `location` | `string` | ✅ |  |
| `workPreference` | `string` | ✅ |  |
| `source` | `string` | ✅ |  |
| `confidence` | `number` | ✅ |  |
| `linkedin` | `string` | ✅ |  |
| `portfolio` | `string` | ✅ |  |
| `cvUrl` | `string` | ✅ |  |
| `cvFileName` | `string` | ✅ |  |
| `cvS3Key` | `string` | ✅ |  |
| `isPublic` | `boolean` | ✅ |  |
| `visibilitySettings` | `object` | ✅ |  |
| `profileSkills` | `Array&lt;ProfileSkill&gt;` | ✅ |  |
| `profileExperiences` | `Array&lt;ProfileExperience&gt;` | ✅ |  |
| `profileProjects` | `Array&lt;ProfileProject&gt;` | ✅ |  |
| `careerIntent` | `CareerIntent` | ✅ |  |
| `workPreferences` | `WorkPreferences` | ✅ |  |
| `cvImportSessions` | `Array&lt;CvImportSession&gt;` | ✅ |  |
| `metadata` | `ProfileMetadata` | ✅ |  |
| `insights` | `Array&lt;ProfileInsight&gt;` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |
| `skills` | `Array&lt;string&gt;` | ✅ |  |
| `experience` | `Array&lt;object&gt;` | ✅ |  |
| `education` | `Array&lt;object&gt;` | ✅ |  |
| `preferredIndustries` | `Array&lt;string&gt;` | ✅ |  |
| `preferredJobTypes` | `Array&lt;string&gt;` | ✅ |  |
| `preferredLocations` | `Array&lt;string&gt;` | ✅ |  |
| `minSalaryExpectation` | `number` | ✅ |  |
| `completenessScore` | `number` | ✅ |  |


**401**: Unauthorized.

---

### Get profile completeness score for target role 
> **GET** `/api/profiles/me/completeness`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `targetRole` | `query` | ❌ | `string` | Target role to calculate completeness for |

#### Responses
**200**: Completeness score returned.
**401**: Unauthorized.
**404**: Profile not found.

---

### Get CV import sessions for current user 
> **GET** `/api/profiles/me/cv/sessions`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: CV import sessions returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `rawText` | `string` | ✅ |  |
| `parsedFields` | `object` | ✅ |  |
| `lowConfidenceFields` | `Array&lt;string&gt;` | ✅ |  |
| `status` | `string` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `confirmedAt` | `string` | ✅ |  |


**401**: Unauthorized.
**404**: Profile not found.

---

### Confirm CV import session and merge to profile 
> **POST** `/api/profiles/me/cv/confirm/{sessionId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `sessionId` | `path` | ✅ | `string` | CV import session ID (UUID) |

#### Responses
**201**: CV import confirmed and merged.
**401**: Unauthorized.
**404**: Profile or session not found.

---

### Discard CV import session 
> **POST** `/api/profiles/me/cv/discard/{sessionId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `sessionId` | `path` | ✅ | `string` | CV import session ID (UUID) |

#### Responses
**201**: Session discarded.
**401**: Unauthorized.
**404**: Profile or session not found.

---

### Get AI insights for current user profile 
> **GET** `/api/profiles/me/insights`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `unreadOnly` | `query` | ❌ | `boolean` |  |

#### Responses
**200**: Profile insights returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `trigger` | `string` | ✅ |  |
| `insight` | `string` | ✅ |  |
| `suggestedAction` | `string` | ✅ |  |
| `relatedProfileFields` | `Array&lt;string&gt;` | ✅ |  |
| `isRead` | `boolean` | ✅ |  |
| `isActioned` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.
**404**: Profile not found.

---

### Mark insight as read 
> **POST** `/api/profiles/me/insights/{insightId}/read`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `insightId` | `path` | ✅ | `string` | Insight ID (UUID) |

#### Responses
**201**: Insight marked as read.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `trigger` | `string` | ✅ |  |
| `insight` | `string` | ✅ |  |
| `suggestedAction` | `string` | ✅ |  |
| `relatedProfileFields` | `Array&lt;string&gt;` | ✅ |  |
| `isRead` | `boolean` | ✅ |  |
| `isActioned` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.
**404**: Profile or insight not found.

---

### Mark insight as actioned 
> **POST** `/api/profiles/me/insights/{insightId}/actioned`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `insightId` | `path` | ✅ | `string` | Insight ID (UUID) |

#### Responses
**201**: Insight marked as actioned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `trigger` | `string` | ✅ |  |
| `insight` | `string` | ✅ |  |
| `suggestedAction` | `string` | ✅ |  |
| `relatedProfileFields` | `Array&lt;string&gt;` | ✅ |  |
| `isRead` | `boolean` | ✅ |  |
| `isActioned` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |


**401**: Unauthorized.
**404**: Profile or insight not found.

---

### Get all skills for current user 
> **GET** `/api/profiles/me/skills`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Skills returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `name` | `string` | ✅ |  |
| `category` | `string` | ✅ |  |
| `level` | `string` | ✅ |  |
| `contexts` | `Array&lt;object&gt;` | ✅ |  |
| `evidence` | `Array&lt;object&gt;` | ✅ |  |
| `source` | `string` | ✅ |  |
| `confidence` | `number` | ✅ |  |
| `lastUsedYear` | `number` | ✅ |  |
| `possibleDuplicate` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Add a new skill 
> **POST** `/api/profiles/me/skills`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | ✅ |  |
| `category` | `string` | ❌ |  |
| `level` | `string` | ❌ |  |
| `contexts` | `Array&lt;SkillContextDto&gt;` | ❌ |  |
| `evidence` | `Array&lt;SkillEvidenceDto&gt;` | ❌ |  |
| `lastUsedYear` | `number` | ❌ |  |

#### Responses
**201**: Skill created.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `name` | `string` | ✅ |  |
| `category` | `string` | ✅ |  |
| `level` | `string` | ✅ |  |
| `contexts` | `Array&lt;object&gt;` | ✅ |  |
| `evidence` | `Array&lt;object&gt;` | ✅ |  |
| `source` | `string` | ✅ |  |
| `confidence` | `number` | ✅ |  |
| `lastUsedYear` | `number` | ✅ |  |
| `possibleDuplicate` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Update a skill 
> **PUT** `/api/profiles/me/skills/{skillId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `skillId` | `path` | ✅ | `string` | Skill ID (UUID) |

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | ❌ |  |
| `category` | `string` | ❌ |  |
| `level` | `string` | ❌ |  |
| `contexts` | `Array&lt;SkillContextDto&gt;` | ❌ |  |
| `evidence` | `Array&lt;SkillEvidenceDto&gt;` | ❌ |  |
| `lastUsedYear` | `number` | ❌ |  |

#### Responses
**200**: Skill updated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `name` | `string` | ✅ |  |
| `category` | `string` | ✅ |  |
| `level` | `string` | ✅ |  |
| `contexts` | `Array&lt;object&gt;` | ✅ |  |
| `evidence` | `Array&lt;object&gt;` | ✅ |  |
| `source` | `string` | ✅ |  |
| `confidence` | `number` | ✅ |  |
| `lastUsedYear` | `number` | ✅ |  |
| `possibleDuplicate` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Delete a skill 
> **DELETE** `/api/profiles/me/skills/{skillId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `skillId` | `path` | ✅ | `string` | Skill ID (UUID) |

#### Responses
**200**: Skill deleted.
**401**: Unauthorized.

---

### Merge duplicate skills 
> **POST** `/api/profiles/me/skills/merge`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `skillIds` | `Array&lt;string&gt;` | ✅ | IDs of skills to merge |
| `targetName` | `string` | ✅ | Name for merged skill |

#### Responses
**201**: Skills merged.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `name` | `string` | ✅ |  |
| `category` | `string` | ✅ |  |
| `level` | `string` | ✅ |  |
| `contexts` | `Array&lt;object&gt;` | ✅ |  |
| `evidence` | `Array&lt;object&gt;` | ✅ |  |
| `source` | `string` | ✅ |  |
| `confidence` | `number` | ✅ |  |
| `lastUsedYear` | `number` | ✅ |  |
| `possibleDuplicate` | `boolean` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Get all experiences for current user 
> **GET** `/api/profiles/me/experiences`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Experiences returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `organization` | `string` | ✅ |  |
| `role` | `string` | ✅ |  |
| `employmentType` | `string` | ✅ |  |
| `startDate` | `string` | ✅ |  |
| `endDate` | `string` | ✅ |  |
| `responsibilities` | `Array&lt;object&gt;` | ✅ |  |
| `scope` | `string` | ✅ |  |
| `skillsUsed` | `Array&lt;string&gt;` | ✅ |  |
| `source` | `string` | ✅ |  |
| `confidence` | `number` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Add a new experience 
> **POST** `/api/profiles/me/experiences`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `organization` | `string` | ✅ |  |
| `role` | `string` | ✅ |  |
| `employmentType` | `string` | ❌ |  |
| `startDate` | `string` | ❌ |  |
| `endDate` | `string` | ❌ |  |
| `responsibilities` | `Array&lt;ResponsibilityDto&gt;` | ❌ |  |
| `scope` | `string` | ❌ |  |
| `skillsUsed` | `Array&lt;string&gt;` | ❌ | Skill IDs |

#### Responses
**201**: Experience created.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `organization` | `string` | ✅ |  |
| `role` | `string` | ✅ |  |
| `employmentType` | `string` | ✅ |  |
| `startDate` | `string` | ✅ |  |
| `endDate` | `string` | ✅ |  |
| `responsibilities` | `Array&lt;object&gt;` | ✅ |  |
| `scope` | `string` | ✅ |  |
| `skillsUsed` | `Array&lt;string&gt;` | ✅ |  |
| `source` | `string` | ✅ |  |
| `confidence` | `number` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Update an experience 
> **PUT** `/api/profiles/me/experiences/{experienceId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `experienceId` | `path` | ✅ | `string` | Experience ID (UUID) |

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `organization` | `string` | ❌ |  |
| `role` | `string` | ❌ |  |
| `employmentType` | `string` | ❌ |  |
| `startDate` | `string` | ❌ |  |
| `endDate` | `string` | ❌ |  |
| `responsibilities` | `Array&lt;ResponsibilityDto&gt;` | ❌ |  |
| `scope` | `string` | ❌ |  |
| `skillsUsed` | `Array&lt;string&gt;` | ❌ |  |

#### Responses
**200**: Experience updated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `organization` | `string` | ✅ |  |
| `role` | `string` | ✅ |  |
| `employmentType` | `string` | ✅ |  |
| `startDate` | `string` | ✅ |  |
| `endDate` | `string` | ✅ |  |
| `responsibilities` | `Array&lt;object&gt;` | ✅ |  |
| `scope` | `string` | ✅ |  |
| `skillsUsed` | `Array&lt;string&gt;` | ✅ |  |
| `source` | `string` | ✅ |  |
| `confidence` | `number` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Delete an experience 
> **DELETE** `/api/profiles/me/experiences/{experienceId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `experienceId` | `path` | ✅ | `string` | Experience ID (UUID) |

#### Responses
**200**: Experience deleted.
**401**: Unauthorized.

---

### Get all projects for current user 
> **GET** `/api/profiles/me/projects`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Projects returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `name` | `string` | ✅ |  |
| `context` | `string` | ✅ |  |
| `description` | `string` | ✅ |  |
| `role` | `string` | ✅ |  |
| `skillsUsed` | `Array&lt;string&gt;` | ✅ |  |
| `outcomes` | `Array&lt;string&gt;` | ✅ |  |
| `source` | `string` | ✅ |  |
| `confidence` | `number` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Add a new project 
> **POST** `/api/profiles/me/projects`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | ✅ |  |
| `context` | `string` | ❌ |  |
| `description` | `string` | ❌ |  |
| `role` | `string` | ❌ |  |
| `skillsUsed` | `Array&lt;string&gt;` | ❌ | Skill IDs |
| `outcomes` | `Array&lt;string&gt;` | ❌ |  |

#### Responses
**201**: Project created.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `name` | `string` | ✅ |  |
| `context` | `string` | ✅ |  |
| `description` | `string` | ✅ |  |
| `role` | `string` | ✅ |  |
| `skillsUsed` | `Array&lt;string&gt;` | ✅ |  |
| `outcomes` | `Array&lt;string&gt;` | ✅ |  |
| `source` | `string` | ✅ |  |
| `confidence` | `number` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Update a project 
> **PUT** `/api/profiles/me/projects/{projectId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `projectId` | `path` | ✅ | `string` | Project ID (UUID) |

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | ❌ |  |
| `context` | `string` | ❌ |  |
| `description` | `string` | ❌ |  |
| `role` | `string` | ❌ |  |
| `skillsUsed` | `Array&lt;string&gt;` | ❌ |  |
| `outcomes` | `Array&lt;string&gt;` | ❌ |  |

#### Responses
**200**: Project updated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `name` | `string` | ✅ |  |
| `context` | `string` | ✅ |  |
| `description` | `string` | ✅ |  |
| `role` | `string` | ✅ |  |
| `skillsUsed` | `Array&lt;string&gt;` | ✅ |  |
| `outcomes` | `Array&lt;string&gt;` | ✅ |  |
| `source` | `string` | ✅ |  |
| `confidence` | `number` | ✅ |  |
| `createdAt` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Delete a project 
> **DELETE** `/api/profiles/me/projects/{projectId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `projectId` | `path` | ✅ | `string` | Project ID (UUID) |

#### Responses
**200**: Project deleted.
**401**: Unauthorized.

---

### Get career intent for current user 
> **GET** `/api/profiles/me/career-intent`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Career intent returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `applyNowRoles` | `Array&lt;string&gt;` | ✅ |  |
| `targetRoles` | `Array&lt;string&gt;` | ✅ |  |
| `desiredSeniority` | `string` | ✅ |  |
| `salaryExpectation` | `object` | ✅ |  |
| `companyPreferences` | `Array&lt;string&gt;` | ✅ |  |
| `industries` | `Array&lt;string&gt;` | ✅ |  |
| `avoid` | `object` | ✅ |  |
| `source` | `string` | ✅ |  |
| `confidence` | `number` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Update career intent 
> **PUT** `/api/profiles/me/career-intent`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `applyNowRoles` | `Array&lt;string&gt;` | ❌ |  |
| `targetRoles` | `Array&lt;string&gt;` | ❌ |  |
| `desiredSeniority` | `string` | ❌ |  |
| `salaryExpectation` | `SalaryRangeDto` | ❌ |  |
| `companyPreferences` | `Array&lt;string&gt;` | ❌ |  |
| `industries` | `Array&lt;string&gt;` | ❌ |  |
| `avoid` | `AvoidPreferencesDto` | ❌ |  |

#### Responses
**200**: Career intent updated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `applyNowRoles` | `Array&lt;string&gt;` | ✅ |  |
| `targetRoles` | `Array&lt;string&gt;` | ✅ |  |
| `desiredSeniority` | `string` | ✅ |  |
| `salaryExpectation` | `object` | ✅ |  |
| `companyPreferences` | `Array&lt;string&gt;` | ✅ |  |
| `industries` | `Array&lt;string&gt;` | ✅ |  |
| `avoid` | `object` | ✅ |  |
| `source` | `string` | ✅ |  |
| `confidence` | `number` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Get work preferences for current user 
> **GET** `/api/profiles/me/work-preferences`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Work preferences returned.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `locations` | `Array&lt;string&gt;` | ✅ |  |
| `workMode` | `string` | ✅ |  |
| `workingHours` | `string` | ✅ |  |
| `languages` | `Array&lt;string&gt;` | ✅ |  |
| `dealBreakers` | `Array&lt;string&gt;` | ✅ |  |
| `source` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Update work preferences 
> **PUT** `/api/profiles/me/work-preferences`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `locations` | `Array&lt;string&gt;` | ❌ |  |
| `workMode` | `string` | ❌ |  |
| `workingHours` | `string` | ❌ |  |
| `languages` | `Array&lt;string&gt;` | ❌ |  |
| `dealBreakers` | `Array&lt;string&gt;` | ❌ |  |

#### Responses
**200**: Work preferences updated.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ |  |
| `profileId` | `string` | ✅ |  |
| `profile` | `Profile` | ✅ |  |
| `locations` | `Array&lt;string&gt;` | ✅ |  |
| `workMode` | `string` | ✅ |  |
| `workingHours` | `string` | ✅ |  |
| `languages` | `Array&lt;string&gt;` | ✅ |  |
| `dealBreakers` | `Array&lt;string&gt;` | ✅ |  |
| `source` | `string` | ✅ |  |
| `updatedAt` | `string` | ✅ |  |


**401**: Unauthorized.

---

### Get public profile by ID 
> **GET** `/api/profiles/{id}`

#### Parameters (Path / Query)
| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | `path` | ✅ | `string` | Profile ID (UUID) |

#### Responses
**200**: Public profile returned.
**404**: Profile not found or is not public.

---

