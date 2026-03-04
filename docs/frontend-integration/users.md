# Integration Guide: users Module

This document provides frontend integration details for the **users** module.

## Endpoints

### Get current user profile 
> **GET** `/api/users/me`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Current user profile returned.
**401**: Unauthorized.

---

