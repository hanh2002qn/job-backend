# Integration Guide: profiles Module

This document provides frontend integration details for the **profiles** module.

## Endpoints

### Get current user profile with completeness score

> **GET** `/api/profiles/me`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

`Any Object`

---

### Update current user profile

> **PUT** `/api/profiles/me`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field               | Type     | Required | Description           |
| ------------------- | -------- | -------- | --------------------- |
| `fullName`          | `string` | ❌       | Full name             |
| `phone`             | `string` | ❌       | Phone number          |
| `address`           | `string` | ❌       | Address               |
| `currentRole`       | `string` | ❌       | Current job role      |
| `seniorityLevel`    | `string` | ❌       | Seniority level       |
| `yearsOfExperience` | `number` | ❌       | Years of experience   |
| `location`          | `string` | ❌       | Current location      |
| `workPreference`    | `string` | ❌       | Preferred work mode   |
| `linkedin`          | `string` | ❌       | LinkedIn profile URL  |
| `portfolio`         | `string` | ❌       | Portfolio website URL |

#### Responses

**200**:

| Field                  | Type                             | Required | Description |
| ---------------------- | -------------------------------- | -------- | ----------- |
| `id`                   | `string`                         | ✅       |             |
| `userId`               | `string`                         | ✅       |             |
| `user`                 | `User`                           | ✅       |             |
| `fullName`             | `string`                         | ✅       |             |
| `phone`                | `string`                         | ✅       |             |
| `address`              | `string`                         | ✅       |             |
| `currentRole`          | `string`                         | ✅       |             |
| `seniorityLevel`       | `string`                         | ✅       |             |
| `yearsOfExperience`    | `number`                         | ✅       |             |
| `location`             | `string`                         | ✅       |             |
| `workPreference`       | `string`                         | ✅       |             |
| `source`               | `string`                         | ✅       |             |
| `confidence`           | `number`                         | ✅       |             |
| `linkedin`             | `string`                         | ✅       |             |
| `portfolio`            | `string`                         | ✅       |             |
| `cvUrl`                | `string`                         | ✅       |             |
| `cvFileName`           | `string`                         | ✅       |             |
| `cvS3Key`              | `string`                         | ✅       |             |
| `isPublic`             | `boolean`                        | ✅       |             |
| `visibilitySettings`   | `object`                         | ✅       |             |
| `profileSkills`        | `Array&lt;ProfileSkill&gt;`      | ✅       |             |
| `profileExperiences`   | `Array&lt;ProfileExperience&gt;` | ✅       |             |
| `profileProjects`      | `Array&lt;ProfileProject&gt;`    | ✅       |             |
| `careerIntent`         | `CareerIntent`                   | ✅       |             |
| `workPreferences`      | `WorkPreferences`                | ✅       |             |
| `cvImportSessions`     | `Array&lt;CvImportSession&gt;`   | ✅       |             |
| `metadata`             | `ProfileMetadata`                | ✅       |             |
| `insights`             | `Array&lt;ProfileInsight&gt;`    | ✅       |             |
| `createdAt`            | `string`                         | ✅       |             |
| `updatedAt`            | `string`                         | ✅       |             |
| `skills`               | `Array&lt;string&gt;`            | ✅       |             |
| `experience`           | `Array&lt;object&gt;`            | ✅       |             |
| `education`            | `Array&lt;object&gt;`            | ✅       |             |
| `preferredIndustries`  | `Array&lt;string&gt;`            | ✅       |             |
| `preferredJobTypes`    | `Array&lt;string&gt;`            | ✅       |             |
| `preferredLocations`   | `Array&lt;string&gt;`            | ✅       |             |
| `minSalaryExpectation` | `number`                         | ✅       |             |
| `completenessScore`    | `number`                         | ✅       |             |

---

### Upload CV and auto-populate profile with AI parsing

> **POST** `/api/profiles/me/cv`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

**Content-Type**: `multipart/form-data`

| Field  | Type     | Required | Description |
| ------ | -------- | -------- | ----------- |
| `file` | `string` | ❌       |             |

#### Responses

**201**:

---

### Upload profile avatar

> **POST** `/api/profiles/me/avatar`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

**Content-Type**: `multipart/form-data`

| Field  | Type     | Required | Description |
| ------ | -------- | -------- | ----------- |
| `file` | `string` | ❌       |             |

#### Responses

**201**:

---

### Update profile visibility settings

> **PUT** `/api/profiles/me/visibility`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field                | Type                    | Required | Description                 |
| -------------------- | ----------------------- | -------- | --------------------------- |
| `isPublic`           | `boolean`               | ❌       | Make profile public/private |
| `visibilitySettings` | `VisibilitySettingsDto` | ❌       |                             |

#### Responses

**200**:

| Field                  | Type                             | Required | Description |
| ---------------------- | -------------------------------- | -------- | ----------- |
| `id`                   | `string`                         | ✅       |             |
| `userId`               | `string`                         | ✅       |             |
| `user`                 | `User`                           | ✅       |             |
| `fullName`             | `string`                         | ✅       |             |
| `phone`                | `string`                         | ✅       |             |
| `address`              | `string`                         | ✅       |             |
| `currentRole`          | `string`                         | ✅       |             |
| `seniorityLevel`       | `string`                         | ✅       |             |
| `yearsOfExperience`    | `number`                         | ✅       |             |
| `location`             | `string`                         | ✅       |             |
| `workPreference`       | `string`                         | ✅       |             |
| `source`               | `string`                         | ✅       |             |
| `confidence`           | `number`                         | ✅       |             |
| `linkedin`             | `string`                         | ✅       |             |
| `portfolio`            | `string`                         | ✅       |             |
| `cvUrl`                | `string`                         | ✅       |             |
| `cvFileName`           | `string`                         | ✅       |             |
| `cvS3Key`              | `string`                         | ✅       |             |
| `isPublic`             | `boolean`                        | ✅       |             |
| `visibilitySettings`   | `object`                         | ✅       |             |
| `profileSkills`        | `Array&lt;ProfileSkill&gt;`      | ✅       |             |
| `profileExperiences`   | `Array&lt;ProfileExperience&gt;` | ✅       |             |
| `profileProjects`      | `Array&lt;ProfileProject&gt;`    | ✅       |             |
| `careerIntent`         | `CareerIntent`                   | ✅       |             |
| `workPreferences`      | `WorkPreferences`                | ✅       |             |
| `cvImportSessions`     | `Array&lt;CvImportSession&gt;`   | ✅       |             |
| `metadata`             | `ProfileMetadata`                | ✅       |             |
| `insights`             | `Array&lt;ProfileInsight&gt;`    | ✅       |             |
| `createdAt`            | `string`                         | ✅       |             |
| `updatedAt`            | `string`                         | ✅       |             |
| `skills`               | `Array&lt;string&gt;`            | ✅       |             |
| `experience`           | `Array&lt;object&gt;`            | ✅       |             |
| `education`            | `Array&lt;object&gt;`            | ✅       |             |
| `preferredIndustries`  | `Array&lt;string&gt;`            | ✅       |             |
| `preferredJobTypes`    | `Array&lt;string&gt;`            | ✅       |             |
| `preferredLocations`   | `Array&lt;string&gt;`            | ✅       |             |
| `minSalaryExpectation` | `number`                         | ✅       |             |
| `completenessScore`    | `number`                         | ✅       |             |

---

### Get profile completeness score for target role

> **GET** `/api/profiles/me/completeness`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name         | In      | Required | Type     | Description                               |
| ------------ | ------- | -------- | -------- | ----------------------------------------- |
| `targetRole` | `query` | ❌       | `string` | Target role to calculate completeness for |

#### Responses

**200**:

`Any Object`

---

### Get CV import sessions for current user

> **GET** `/api/profiles/me/cv/sessions`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

| Field                 | Type                  | Required | Description |
| --------------------- | --------------------- | -------- | ----------- |
| `id`                  | `string`              | ✅       |             |
| `profileId`           | `string`              | ✅       |             |
| `profile`             | `Profile`             | ✅       |             |
| `rawText`             | `string`              | ✅       |             |
| `parsedFields`        | `object`              | ✅       |             |
| `lowConfidenceFields` | `Array&lt;string&gt;` | ✅       |             |
| `status`              | `string`              | ✅       |             |
| `createdAt`           | `string`              | ✅       |             |
| `confirmedAt`         | `string`              | ✅       |             |

---

### Confirm CV import session and merge to profile

> **POST** `/api/profiles/me/cv/confirm/{sessionId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name        | In     | Required | Type     | Description |
| ----------- | ------ | -------- | -------- | ----------- |
| `sessionId` | `path` | ✅       | `string` |             |

#### Responses

**201**:

---

### Discard CV import session

> **POST** `/api/profiles/me/cv/discard/{sessionId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name        | In     | Required | Type     | Description |
| ----------- | ------ | -------- | -------- | ----------- |
| `sessionId` | `path` | ✅       | `string` |             |

#### Responses

**201**:

---

### Get AI insights for current user profile

> **GET** `/api/profiles/me/insights`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name         | In      | Required | Type      | Description |
| ------------ | ------- | -------- | --------- | ----------- |
| `unreadOnly` | `query` | ❌       | `boolean` |             |

#### Responses

**200**:

| Field                  | Type                  | Required | Description |
| ---------------------- | --------------------- | -------- | ----------- |
| `id`                   | `string`              | ✅       |             |
| `profileId`            | `string`              | ✅       |             |
| `profile`              | `Profile`             | ✅       |             |
| `trigger`              | `string`              | ✅       |             |
| `insight`              | `string`              | ✅       |             |
| `suggestedAction`      | `string`              | ✅       |             |
| `relatedProfileFields` | `Array&lt;string&gt;` | ✅       |             |
| `isRead`               | `boolean`             | ✅       |             |
| `isActioned`           | `boolean`             | ✅       |             |
| `createdAt`            | `string`              | ✅       |             |

---

### Mark insight as read

> **POST** `/api/profiles/me/insights/{insightId}/read`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name        | In     | Required | Type     | Description |
| ----------- | ------ | -------- | -------- | ----------- |
| `insightId` | `path` | ✅       | `string` |             |

#### Responses

**201**:

| Field                  | Type                  | Required | Description |
| ---------------------- | --------------------- | -------- | ----------- |
| `id`                   | `string`              | ✅       |             |
| `profileId`            | `string`              | ✅       |             |
| `profile`              | `Profile`             | ✅       |             |
| `trigger`              | `string`              | ✅       |             |
| `insight`              | `string`              | ✅       |             |
| `suggestedAction`      | `string`              | ✅       |             |
| `relatedProfileFields` | `Array&lt;string&gt;` | ✅       |             |
| `isRead`               | `boolean`             | ✅       |             |
| `isActioned`           | `boolean`             | ✅       |             |
| `createdAt`            | `string`              | ✅       |             |

---

### Mark insight as actioned

> **POST** `/api/profiles/me/insights/{insightId}/actioned`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name        | In     | Required | Type     | Description |
| ----------- | ------ | -------- | -------- | ----------- |
| `insightId` | `path` | ✅       | `string` |             |

#### Responses

**201**:

| Field                  | Type                  | Required | Description |
| ---------------------- | --------------------- | -------- | ----------- |
| `id`                   | `string`              | ✅       |             |
| `profileId`            | `string`              | ✅       |             |
| `profile`              | `Profile`             | ✅       |             |
| `trigger`              | `string`              | ✅       |             |
| `insight`              | `string`              | ✅       |             |
| `suggestedAction`      | `string`              | ✅       |             |
| `relatedProfileFields` | `Array&lt;string&gt;` | ✅       |             |
| `isRead`               | `boolean`             | ✅       |             |
| `isActioned`           | `boolean`             | ✅       |             |
| `createdAt`            | `string`              | ✅       |             |

---

### Get all skills for current user

> **GET** `/api/profiles/me/skills`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

| Field               | Type                  | Required | Description |
| ------------------- | --------------------- | -------- | ----------- |
| `id`                | `string`              | ✅       |             |
| `profileId`         | `string`              | ✅       |             |
| `profile`           | `Profile`             | ✅       |             |
| `name`              | `string`              | ✅       |             |
| `category`          | `string`              | ✅       |             |
| `level`             | `string`              | ✅       |             |
| `contexts`          | `Array&lt;object&gt;` | ✅       |             |
| `evidence`          | `Array&lt;object&gt;` | ✅       |             |
| `source`            | `string`              | ✅       |             |
| `confidence`        | `number`              | ✅       |             |
| `lastUsedYear`      | `number`              | ✅       |             |
| `possibleDuplicate` | `boolean`             | ✅       |             |
| `createdAt`         | `string`              | ✅       |             |
| `updatedAt`         | `string`              | ✅       |             |

---

### Add a new skill

> **POST** `/api/profiles/me/skills`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field          | Type                            | Required | Description |
| -------------- | ------------------------------- | -------- | ----------- |
| `name`         | `string`                        | ✅       |             |
| `category`     | `string`                        | ❌       |             |
| `level`        | `string`                        | ❌       |             |
| `contexts`     | `Array&lt;SkillContextDto&gt;`  | ❌       |             |
| `evidence`     | `Array&lt;SkillEvidenceDto&gt;` | ❌       |             |
| `lastUsedYear` | `number`                        | ❌       |             |

#### Responses

**201**:

| Field               | Type                  | Required | Description |
| ------------------- | --------------------- | -------- | ----------- |
| `id`                | `string`              | ✅       |             |
| `profileId`         | `string`              | ✅       |             |
| `profile`           | `Profile`             | ✅       |             |
| `name`              | `string`              | ✅       |             |
| `category`          | `string`              | ✅       |             |
| `level`             | `string`              | ✅       |             |
| `contexts`          | `Array&lt;object&gt;` | ✅       |             |
| `evidence`          | `Array&lt;object&gt;` | ✅       |             |
| `source`            | `string`              | ✅       |             |
| `confidence`        | `number`              | ✅       |             |
| `lastUsedYear`      | `number`              | ✅       |             |
| `possibleDuplicate` | `boolean`             | ✅       |             |
| `createdAt`         | `string`              | ✅       |             |
| `updatedAt`         | `string`              | ✅       |             |

---

### Update a skill

> **PUT** `/api/profiles/me/skills/{skillId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name      | In     | Required | Type     | Description |
| --------- | ------ | -------- | -------- | ----------- |
| `skillId` | `path` | ✅       | `string` |             |

#### Request Body

| Field          | Type                            | Required | Description |
| -------------- | ------------------------------- | -------- | ----------- |
| `name`         | `string`                        | ❌       |             |
| `category`     | `string`                        | ❌       |             |
| `level`        | `string`                        | ❌       |             |
| `contexts`     | `Array&lt;SkillContextDto&gt;`  | ❌       |             |
| `evidence`     | `Array&lt;SkillEvidenceDto&gt;` | ❌       |             |
| `lastUsedYear` | `number`                        | ❌       |             |

#### Responses

**200**:

| Field               | Type                  | Required | Description |
| ------------------- | --------------------- | -------- | ----------- |
| `id`                | `string`              | ✅       |             |
| `profileId`         | `string`              | ✅       |             |
| `profile`           | `Profile`             | ✅       |             |
| `name`              | `string`              | ✅       |             |
| `category`          | `string`              | ✅       |             |
| `level`             | `string`              | ✅       |             |
| `contexts`          | `Array&lt;object&gt;` | ✅       |             |
| `evidence`          | `Array&lt;object&gt;` | ✅       |             |
| `source`            | `string`              | ✅       |             |
| `confidence`        | `number`              | ✅       |             |
| `lastUsedYear`      | `number`              | ✅       |             |
| `possibleDuplicate` | `boolean`             | ✅       |             |
| `createdAt`         | `string`              | ✅       |             |
| `updatedAt`         | `string`              | ✅       |             |

---

### Delete a skill

> **DELETE** `/api/profiles/me/skills/{skillId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name      | In     | Required | Type     | Description |
| --------- | ------ | -------- | -------- | ----------- |
| `skillId` | `path` | ✅       | `string` |             |

#### Responses

**200**:

---

### Merge duplicate skills

> **POST** `/api/profiles/me/skills/merge`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field        | Type                  | Required | Description            |
| ------------ | --------------------- | -------- | ---------------------- |
| `skillIds`   | `Array&lt;string&gt;` | ✅       | IDs of skills to merge |
| `targetName` | `string`              | ✅       | Name for merged skill  |

#### Responses

**201**:

| Field               | Type                  | Required | Description |
| ------------------- | --------------------- | -------- | ----------- |
| `id`                | `string`              | ✅       |             |
| `profileId`         | `string`              | ✅       |             |
| `profile`           | `Profile`             | ✅       |             |
| `name`              | `string`              | ✅       |             |
| `category`          | `string`              | ✅       |             |
| `level`             | `string`              | ✅       |             |
| `contexts`          | `Array&lt;object&gt;` | ✅       |             |
| `evidence`          | `Array&lt;object&gt;` | ✅       |             |
| `source`            | `string`              | ✅       |             |
| `confidence`        | `number`              | ✅       |             |
| `lastUsedYear`      | `number`              | ✅       |             |
| `possibleDuplicate` | `boolean`             | ✅       |             |
| `createdAt`         | `string`              | ✅       |             |
| `updatedAt`         | `string`              | ✅       |             |

---

### Get all experiences for current user

> **GET** `/api/profiles/me/experiences`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

| Field              | Type                  | Required | Description |
| ------------------ | --------------------- | -------- | ----------- |
| `id`               | `string`              | ✅       |             |
| `profileId`        | `string`              | ✅       |             |
| `profile`          | `Profile`             | ✅       |             |
| `organization`     | `string`              | ✅       |             |
| `role`             | `string`              | ✅       |             |
| `employmentType`   | `string`              | ✅       |             |
| `startDate`        | `string`              | ✅       |             |
| `endDate`          | `string`              | ✅       |             |
| `responsibilities` | `Array&lt;object&gt;` | ✅       |             |
| `scope`            | `string`              | ✅       |             |
| `skillsUsed`       | `Array&lt;string&gt;` | ✅       |             |
| `source`           | `string`              | ✅       |             |
| `confidence`       | `number`              | ✅       |             |
| `createdAt`        | `string`              | ✅       |             |
| `updatedAt`        | `string`              | ✅       |             |

---

### Add a new experience

> **POST** `/api/profiles/me/experiences`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field              | Type                             | Required | Description |
| ------------------ | -------------------------------- | -------- | ----------- |
| `organization`     | `string`                         | ✅       |             |
| `role`             | `string`                         | ✅       |             |
| `employmentType`   | `string`                         | ❌       |             |
| `startDate`        | `string`                         | ❌       |             |
| `endDate`          | `string`                         | ❌       |             |
| `responsibilities` | `Array&lt;ResponsibilityDto&gt;` | ❌       |             |
| `scope`            | `string`                         | ❌       |             |
| `skillsUsed`       | `Array&lt;string&gt;`            | ❌       | Skill IDs   |

#### Responses

**201**:

| Field              | Type                  | Required | Description |
| ------------------ | --------------------- | -------- | ----------- |
| `id`               | `string`              | ✅       |             |
| `profileId`        | `string`              | ✅       |             |
| `profile`          | `Profile`             | ✅       |             |
| `organization`     | `string`              | ✅       |             |
| `role`             | `string`              | ✅       |             |
| `employmentType`   | `string`              | ✅       |             |
| `startDate`        | `string`              | ✅       |             |
| `endDate`          | `string`              | ✅       |             |
| `responsibilities` | `Array&lt;object&gt;` | ✅       |             |
| `scope`            | `string`              | ✅       |             |
| `skillsUsed`       | `Array&lt;string&gt;` | ✅       |             |
| `source`           | `string`              | ✅       |             |
| `confidence`       | `number`              | ✅       |             |
| `createdAt`        | `string`              | ✅       |             |
| `updatedAt`        | `string`              | ✅       |             |

---

### Update an experience

> **PUT** `/api/profiles/me/experiences/{experienceId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name           | In     | Required | Type     | Description |
| -------------- | ------ | -------- | -------- | ----------- |
| `experienceId` | `path` | ✅       | `string` |             |

#### Request Body

| Field              | Type                             | Required | Description |
| ------------------ | -------------------------------- | -------- | ----------- |
| `organization`     | `string`                         | ❌       |             |
| `role`             | `string`                         | ❌       |             |
| `employmentType`   | `string`                         | ❌       |             |
| `startDate`        | `string`                         | ❌       |             |
| `endDate`          | `string`                         | ❌       |             |
| `responsibilities` | `Array&lt;ResponsibilityDto&gt;` | ❌       |             |
| `scope`            | `string`                         | ❌       |             |
| `skillsUsed`       | `Array&lt;string&gt;`            | ❌       |             |

#### Responses

**200**:

| Field              | Type                  | Required | Description |
| ------------------ | --------------------- | -------- | ----------- |
| `id`               | `string`              | ✅       |             |
| `profileId`        | `string`              | ✅       |             |
| `profile`          | `Profile`             | ✅       |             |
| `organization`     | `string`              | ✅       |             |
| `role`             | `string`              | ✅       |             |
| `employmentType`   | `string`              | ✅       |             |
| `startDate`        | `string`              | ✅       |             |
| `endDate`          | `string`              | ✅       |             |
| `responsibilities` | `Array&lt;object&gt;` | ✅       |             |
| `scope`            | `string`              | ✅       |             |
| `skillsUsed`       | `Array&lt;string&gt;` | ✅       |             |
| `source`           | `string`              | ✅       |             |
| `confidence`       | `number`              | ✅       |             |
| `createdAt`        | `string`              | ✅       |             |
| `updatedAt`        | `string`              | ✅       |             |

---

### Delete an experience

> **DELETE** `/api/profiles/me/experiences/{experienceId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name           | In     | Required | Type     | Description |
| -------------- | ------ | -------- | -------- | ----------- |
| `experienceId` | `path` | ✅       | `string` |             |

#### Responses

**200**:

---

### Get all projects for current user

> **GET** `/api/profiles/me/projects`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

| Field         | Type                  | Required | Description |
| ------------- | --------------------- | -------- | ----------- |
| `id`          | `string`              | ✅       |             |
| `profileId`   | `string`              | ✅       |             |
| `profile`     | `Profile`             | ✅       |             |
| `name`        | `string`              | ✅       |             |
| `context`     | `string`              | ✅       |             |
| `description` | `string`              | ✅       |             |
| `role`        | `string`              | ✅       |             |
| `skillsUsed`  | `Array&lt;string&gt;` | ✅       |             |
| `outcomes`    | `Array&lt;string&gt;` | ✅       |             |
| `source`      | `string`              | ✅       |             |
| `confidence`  | `number`              | ✅       |             |
| `createdAt`   | `string`              | ✅       |             |
| `updatedAt`   | `string`              | ✅       |             |

---

### Add a new project

> **POST** `/api/profiles/me/projects`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field         | Type                  | Required | Description |
| ------------- | --------------------- | -------- | ----------- |
| `name`        | `string`              | ✅       |             |
| `context`     | `string`              | ❌       |             |
| `description` | `string`              | ❌       |             |
| `role`        | `string`              | ❌       |             |
| `skillsUsed`  | `Array&lt;string&gt;` | ❌       | Skill IDs   |
| `outcomes`    | `Array&lt;string&gt;` | ❌       |             |

#### Responses

**201**:

| Field         | Type                  | Required | Description |
| ------------- | --------------------- | -------- | ----------- |
| `id`          | `string`              | ✅       |             |
| `profileId`   | `string`              | ✅       |             |
| `profile`     | `Profile`             | ✅       |             |
| `name`        | `string`              | ✅       |             |
| `context`     | `string`              | ✅       |             |
| `description` | `string`              | ✅       |             |
| `role`        | `string`              | ✅       |             |
| `skillsUsed`  | `Array&lt;string&gt;` | ✅       |             |
| `outcomes`    | `Array&lt;string&gt;` | ✅       |             |
| `source`      | `string`              | ✅       |             |
| `confidence`  | `number`              | ✅       |             |
| `createdAt`   | `string`              | ✅       |             |
| `updatedAt`   | `string`              | ✅       |             |

---

### Update a project

> **PUT** `/api/profiles/me/projects/{projectId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name        | In     | Required | Type     | Description |
| ----------- | ------ | -------- | -------- | ----------- |
| `projectId` | `path` | ✅       | `string` |             |

#### Request Body

| Field         | Type                  | Required | Description |
| ------------- | --------------------- | -------- | ----------- |
| `name`        | `string`              | ❌       |             |
| `context`     | `string`              | ❌       |             |
| `description` | `string`              | ❌       |             |
| `role`        | `string`              | ❌       |             |
| `skillsUsed`  | `Array&lt;string&gt;` | ❌       |             |
| `outcomes`    | `Array&lt;string&gt;` | ❌       |             |

#### Responses

**200**:

| Field         | Type                  | Required | Description |
| ------------- | --------------------- | -------- | ----------- |
| `id`          | `string`              | ✅       |             |
| `profileId`   | `string`              | ✅       |             |
| `profile`     | `Profile`             | ✅       |             |
| `name`        | `string`              | ✅       |             |
| `context`     | `string`              | ✅       |             |
| `description` | `string`              | ✅       |             |
| `role`        | `string`              | ✅       |             |
| `skillsUsed`  | `Array&lt;string&gt;` | ✅       |             |
| `outcomes`    | `Array&lt;string&gt;` | ✅       |             |
| `source`      | `string`              | ✅       |             |
| `confidence`  | `number`              | ✅       |             |
| `createdAt`   | `string`              | ✅       |             |
| `updatedAt`   | `string`              | ✅       |             |

---

### Delete a project

> **DELETE** `/api/profiles/me/projects/{projectId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name        | In     | Required | Type     | Description |
| ----------- | ------ | -------- | -------- | ----------- |
| `projectId` | `path` | ✅       | `string` |             |

#### Responses

**200**:

---

### Get career intent for current user

> **GET** `/api/profiles/me/career-intent`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

`Any Object`

---

### Update career intent

> **PUT** `/api/profiles/me/career-intent`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field                | Type                  | Required | Description |
| -------------------- | --------------------- | -------- | ----------- |
| `applyNowRoles`      | `Array&lt;string&gt;` | ❌       |             |
| `targetRoles`        | `Array&lt;string&gt;` | ❌       |             |
| `desiredSeniority`   | `string`              | ❌       |             |
| `salaryExpectation`  | `SalaryRangeDto`      | ❌       |             |
| `companyPreferences` | `Array&lt;string&gt;` | ❌       |             |
| `industries`         | `Array&lt;string&gt;` | ❌       |             |
| `avoid`              | `AvoidPreferencesDto` | ❌       |             |

#### Responses

**200**:

| Field                | Type                  | Required | Description |
| -------------------- | --------------------- | -------- | ----------- |
| `id`                 | `string`              | ✅       |             |
| `profileId`          | `string`              | ✅       |             |
| `profile`            | `Profile`             | ✅       |             |
| `applyNowRoles`      | `Array&lt;string&gt;` | ✅       |             |
| `targetRoles`        | `Array&lt;string&gt;` | ✅       |             |
| `desiredSeniority`   | `string`              | ✅       |             |
| `salaryExpectation`  | `object`              | ✅       |             |
| `companyPreferences` | `Array&lt;string&gt;` | ✅       |             |
| `industries`         | `Array&lt;string&gt;` | ✅       |             |
| `avoid`              | `object`              | ✅       |             |
| `source`             | `string`              | ✅       |             |
| `confidence`         | `number`              | ✅       |             |
| `updatedAt`          | `string`              | ✅       |             |

---

### Get work preferences for current user

> **GET** `/api/profiles/me/work-preferences`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

`Any Object`

---

### Update work preferences

> **PUT** `/api/profiles/me/work-preferences`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field          | Type                  | Required | Description |
| -------------- | --------------------- | -------- | ----------- |
| `locations`    | `Array&lt;string&gt;` | ❌       |             |
| `workMode`     | `string`              | ❌       |             |
| `workingHours` | `string`              | ❌       |             |
| `languages`    | `Array&lt;string&gt;` | ❌       |             |
| `dealBreakers` | `Array&lt;string&gt;` | ❌       |             |

#### Responses

**200**:

| Field          | Type                  | Required | Description |
| -------------- | --------------------- | -------- | ----------- |
| `id`           | `string`              | ✅       |             |
| `profileId`    | `string`              | ✅       |             |
| `profile`      | `Profile`             | ✅       |             |
| `locations`    | `Array&lt;string&gt;` | ✅       |             |
| `workMode`     | `string`              | ✅       |             |
| `workingHours` | `string`              | ✅       |             |
| `languages`    | `Array&lt;string&gt;` | ✅       |             |
| `dealBreakers` | `Array&lt;string&gt;` | ✅       |             |
| `source`       | `string`              | ✅       |             |
| `updatedAt`    | `string`              | ✅       |             |

---

### Get public profile by ID

> **GET** `/api/profiles/{id}`

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description       |
| ---- | ------ | -------- | -------- | ----------------- |
| `id` | `path` | ✅       | `string` | Profile ID (UUID) |

#### Responses

**200**:

`Any Object`

---
