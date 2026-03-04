# Integration Guide: tracker Module

This document provides frontend integration details for the **tracker** module.

## Endpoints

### Track a new job

> **POST** `/api/tracker`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field           | Type     | Required | Description |
| --------------- | -------- | -------- | ----------- |
| `jobId`         | `string` | ❌       |             |
| `manualTitle`   | `string` | ❌       |             |
| `manualCompany` | `string` | ❌       |             |
| `manualUrl`     | `string` | ❌       |             |
| `status`        | `string` | ❌       |             |

#### Responses

**201**:

| Field            | Type                             | Required | Description |
| ---------------- | -------------------------------- | -------- | ----------- |
| `id`             | `string`                         | ✅       |             |
| `userId`         | `string`                         | ✅       |             |
| `user`           | `User`                           | ✅       |             |
| `jobId`          | `string`                         | ✅       |             |
| `job`            | `Job`                            | ✅       |             |
| `manualTitle`    | `string`                         | ✅       |             |
| `manualCompany`  | `string`                         | ✅       |             |
| `manualUrl`      | `string`                         | ✅       |             |
| `status`         | `string`                         | ✅       |             |
| `appliedAt`      | `string`                         | ✅       |             |
| `cvId`           | `string`                         | ✅       |             |
| `cv`             | `CV`                             | ✅       |             |
| `notes`          | `string`                         | ✅       |             |
| `nextActionDate` | `string`                         | ✅       |             |
| `isReminderSent` | `boolean`                        | ✅       |             |
| `createdAt`      | `string`                         | ✅       |             |
| `updatedAt`      | `string`                         | ✅       |             |
| `interviews`     | `Array&lt;InterviewSchedule&gt;` | ✅       |             |

---

### Get all tracked jobs with filtering and sorting

> **GET** `/api/tracker`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name      | In      | Required | Type     | Description |
| --------- | ------- | -------- | -------- | ----------- |
| `status`  | `query` | ❌       | `string` |             |
| `company` | `query` | ❌       | `string` |             |
| `title`   | `query` | ❌       | `string` |             |
| `sortBy`  | `query` | ❌       | `string` |             |
| `order`   | `query` | ❌       | `string` |             |

#### Responses

**200**:

| Field            | Type                             | Required | Description |
| ---------------- | -------------------------------- | -------- | ----------- |
| `id`             | `string`                         | ✅       |             |
| `userId`         | `string`                         | ✅       |             |
| `user`           | `User`                           | ✅       |             |
| `jobId`          | `string`                         | ✅       |             |
| `job`            | `Job`                            | ✅       |             |
| `manualTitle`    | `string`                         | ✅       |             |
| `manualCompany`  | `string`                         | ✅       |             |
| `manualUrl`      | `string`                         | ✅       |             |
| `status`         | `string`                         | ✅       |             |
| `appliedAt`      | `string`                         | ✅       |             |
| `cvId`           | `string`                         | ✅       |             |
| `cv`             | `CV`                             | ✅       |             |
| `notes`          | `string`                         | ✅       |             |
| `nextActionDate` | `string`                         | ✅       |             |
| `isReminderSent` | `boolean`                        | ✅       |             |
| `createdAt`      | `string`                         | ✅       |             |
| `updatedAt`      | `string`                         | ✅       |             |
| `interviews`     | `Array&lt;InterviewSchedule&gt;` | ✅       |             |

---

### Get all scheduled interviews

> **GET** `/api/tracker/interviews/calendar`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

| Field              | Type         | Required | Description |
| ------------------ | ------------ | -------- | ----------- |
| `id`               | `string`     | ✅       |             |
| `trackerId`        | `string`     | ✅       |             |
| `tracker`          | `JobTracker` | ✅       |             |
| `roundName`        | `string`     | ✅       |             |
| `scheduledAt`      | `string`     | ✅       |             |
| `type`             | `string`     | ✅       |             |
| `locationUrl`      | `string`     | ✅       |             |
| `notes`            | `string`     | ✅       |             |
| `prepTips`         | `object`     | ✅       |             |
| `googleEventId`    | `string`     | ✅       |             |
| `calendarSyncedAt` | `string`     | ✅       |             |
| `durationMinutes`  | `number`     | ✅       |             |
| `createdAt`        | `string`     | ✅       |             |
| `updatedAt`        | `string`     | ✅       |             |

---

### Get AI preparation tips for an interview

> **GET** `/api/tracker/interviews/{id}/prep-tips`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**200**:

`Any Object`

---

### Get application statistics

> **GET** `/api/tracker/stats`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

`Any Object`

---

### Schedule an interview for a tracked job

> **POST** `/api/tracker/{id}/interviews`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Request Body

| Field         | Type     | Required | Description                    |
| ------------- | -------- | -------- | ------------------------------ |
| `roundName`   | `string` | ✅       | Name of the interview round    |
| `scheduledAt` | `string` | ✅       | Scheduled date and time        |
| `type`        | `string` | ✅       |                                |
| `locationUrl` | `string` | ❌       | Meeting link or office address |
| `notes`       | `string` | ❌       | Additional notes               |

#### Responses

**201**:

| Field              | Type         | Required | Description |
| ------------------ | ------------ | -------- | ----------- |
| `id`               | `string`     | ✅       |             |
| `trackerId`        | `string`     | ✅       |             |
| `tracker`          | `JobTracker` | ✅       |             |
| `roundName`        | `string`     | ✅       |             |
| `scheduledAt`      | `string`     | ✅       |             |
| `type`             | `string`     | ✅       |             |
| `locationUrl`      | `string`     | ✅       |             |
| `notes`            | `string`     | ✅       |             |
| `prepTips`         | `object`     | ✅       |             |
| `googleEventId`    | `string`     | ✅       |             |
| `calendarSyncedAt` | `string`     | ✅       |             |
| `durationMinutes`  | `number`     | ✅       |             |
| `createdAt`        | `string`     | ✅       |             |
| `updatedAt`        | `string`     | ✅       |             |

---

### Bulk update status for multiply trackers

> **POST** `/api/tracker/bulk-status`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field        | Type                  | Required | Description                    |
| ------------ | --------------------- | -------- | ------------------------------ |
| `trackerIds` | `Array&lt;string&gt;` | ✅       | Array of tracker IDs to update |
| `status`     | `string`              | ✅       | New status to apply            |

#### Responses

**201**:

---

### Add a note to a tracker

> **POST** `/api/tracker/{id}/notes`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Request Body

| Field     | Type     | Required | Description  |
| --------- | -------- | -------- | ------------ |
| `content` | `string` | ✅       | Note content |

#### Responses

**201**:

| Field       | Type         | Required | Description |
| ----------- | ------------ | -------- | ----------- |
| `id`        | `string`     | ✅       |             |
| `trackerId` | `string`     | ✅       |             |
| `tracker`   | `JobTracker` | ✅       |             |
| `userId`    | `string`     | ✅       |             |
| `user`      | `User`       | ✅       |             |
| `content`   | `string`     | ✅       |             |
| `createdAt` | `string`     | ✅       |             |
| `updatedAt` | `string`     | ✅       |             |

---

### Get all notes for a tracker

> **GET** `/api/tracker/{id}/notes`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**200**:

| Field       | Type         | Required | Description |
| ----------- | ------------ | -------- | ----------- |
| `id`        | `string`     | ✅       |             |
| `trackerId` | `string`     | ✅       |             |
| `tracker`   | `JobTracker` | ✅       |             |
| `userId`    | `string`     | ✅       |             |
| `user`      | `User`       | ✅       |             |
| `content`   | `string`     | ✅       |             |
| `createdAt` | `string`     | ✅       |             |
| `updatedAt` | `string`     | ✅       |             |

---

### Update a note

> **PATCH** `/api/tracker/notes/{noteId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name     | In     | Required | Type     | Description |
| -------- | ------ | -------- | -------- | ----------- |
| `noteId` | `path` | ✅       | `string` |             |

#### Request Body

| Field     | Type     | Required | Description          |
| --------- | -------- | -------- | -------------------- |
| `content` | `string` | ✅       | Updated note content |

#### Responses

**200**:

| Field       | Type         | Required | Description |
| ----------- | ------------ | -------- | ----------- |
| `id`        | `string`     | ✅       |             |
| `trackerId` | `string`     | ✅       |             |
| `tracker`   | `JobTracker` | ✅       |             |
| `userId`    | `string`     | ✅       |             |
| `user`      | `User`       | ✅       |             |
| `content`   | `string`     | ✅       |             |
| `createdAt` | `string`     | ✅       |             |
| `updatedAt` | `string`     | ✅       |             |

---

### Delete a note

> **DELETE** `/api/tracker/notes/{noteId}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name     | In     | Required | Type     | Description |
| -------- | ------ | -------- | -------- | ----------- |
| `noteId` | `path` | ✅       | `string` |             |

#### Responses

**200**:

| Field       | Type         | Required | Description |
| ----------- | ------------ | -------- | ----------- |
| `id`        | `string`     | ✅       |             |
| `trackerId` | `string`     | ✅       |             |
| `tracker`   | `JobTracker` | ✅       |             |
| `userId`    | `string`     | ✅       |             |
| `user`      | `User`       | ✅       |             |
| `content`   | `string`     | ✅       |             |
| `createdAt` | `string`     | ✅       |             |
| `updatedAt` | `string`     | ✅       |             |

---

### Update tracker entry (status, notes, cv, etc.)

> **PATCH** `/api/tracker/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Request Body

| Field            | Type     | Required | Description |
| ---------------- | -------- | -------- | ----------- |
| `status`         | `string` | ❌       |             |
| `cvId`           | `string` | ❌       |             |
| `notes`          | `string` | ❌       |             |
| `nextActionDate` | `string` | ❌       |             |

#### Responses

**200**:

| Field            | Type                             | Required | Description |
| ---------------- | -------------------------------- | -------- | ----------- |
| `id`             | `string`                         | ✅       |             |
| `userId`         | `string`                         | ✅       |             |
| `user`           | `User`                           | ✅       |             |
| `jobId`          | `string`                         | ✅       |             |
| `job`            | `Job`                            | ✅       |             |
| `manualTitle`    | `string`                         | ✅       |             |
| `manualCompany`  | `string`                         | ✅       |             |
| `manualUrl`      | `string`                         | ✅       |             |
| `status`         | `string`                         | ✅       |             |
| `appliedAt`      | `string`                         | ✅       |             |
| `cvId`           | `string`                         | ✅       |             |
| `cv`             | `CV`                             | ✅       |             |
| `notes`          | `string`                         | ✅       |             |
| `nextActionDate` | `string`                         | ✅       |             |
| `isReminderSent` | `boolean`                        | ✅       |             |
| `createdAt`      | `string`                         | ✅       |             |
| `updatedAt`      | `string`                         | ✅       |             |
| `interviews`     | `Array&lt;InterviewSchedule&gt;` | ✅       |             |

---

### Remove a job from tracking list

> **DELETE** `/api/tracker/{id}`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Parameters (Path / Query)

| Name | In     | Required | Type     | Description |
| ---- | ------ | -------- | -------- | ----------- |
| `id` | `path` | ✅       | `string` |             |

#### Responses

**200**:

| Field            | Type                             | Required | Description |
| ---------------- | -------------------------------- | -------- | ----------- |
| `id`             | `string`                         | ✅       |             |
| `userId`         | `string`                         | ✅       |             |
| `user`           | `User`                           | ✅       |             |
| `jobId`          | `string`                         | ✅       |             |
| `job`            | `Job`                            | ✅       |             |
| `manualTitle`    | `string`                         | ✅       |             |
| `manualCompany`  | `string`                         | ✅       |             |
| `manualUrl`      | `string`                         | ✅       |             |
| `status`         | `string`                         | ✅       |             |
| `appliedAt`      | `string`                         | ✅       |             |
| `cvId`           | `string`                         | ✅       |             |
| `cv`             | `CV`                             | ✅       |             |
| `notes`          | `string`                         | ✅       |             |
| `nextActionDate` | `string`                         | ✅       |             |
| `isReminderSent` | `boolean`                        | ✅       |             |
| `createdAt`      | `string`                         | ✅       |             |
| `updatedAt`      | `string`                         | ✅       |             |
| `interviews`     | `Array&lt;InterviewSchedule&gt;` | ✅       |             |

---
