# Integration Guide: admin/dashboard Module

This document provides frontend integration details for the **admin/dashboard** module.

## Endpoints

### Get dashboard statistics 
> **GET** `/api/admin/dashboard/stats`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Dashboard stats returned.
**401**: Unauthorized.
**403**: Forbidden. Admin role required.

---

### Get user growth chart data (last 30 days) 
> **GET** `/api/admin/dashboard/chart/users`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: User growth chart data returned.

---

### Toggle maintenance mode 
> **POST** `/api/admin/dashboard/maintenance`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**201**: Maintenance mode toggled.

---

### Get recent transactions (charges) 
> **GET** `/api/admin/dashboard/transactions`

🛡️ **Requires Authentication**: Yes (Bearer Token)

#### Responses
**200**: Recent transactions returned.

---

