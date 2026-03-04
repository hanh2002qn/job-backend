# Integration Guide: export Module

This document provides frontend integration details for the **export** module.

## Endpoints

### Export CV to PDF/DOCX

> **POST** `/api/export/cv`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field    | Type     | Required | Description |
| -------- | -------- | -------- | ----------- |
| `cvId`   | `string` | ✅       |             |
| `format` | `string` | ✅       |             |

#### Responses

**201**:

---

### Export Cover Letter to PDF/DOCX

> **POST** `/api/export/cover-letter`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Request Body

| Field           | Type     | Required | Description |
| --------------- | -------- | -------- | ----------- |
| `coverLetterId` | `string` | ✅       |             |
| `format`        | `string` | ✅       |             |

#### Responses

**201**:

---

### Export Job Tracker to CSV

> **GET** `/api/export/tracker/csv`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses

**200**:

---
