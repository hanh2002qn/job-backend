# Integration Guide: admin/crawler Module

This document provides frontend integration details for the **admin/crawler** module.

## Endpoints

### Trigger job crawler manually 
> **POST** `/api/admin/crawler/trigger`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**201**: Crawler triggered or platform unsupported.
**401**: Unauthorized.
**403**: Forbidden. Admin role required.

---

