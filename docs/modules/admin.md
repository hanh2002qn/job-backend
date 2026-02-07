# Admin Module

Admin dashboard and management features.

## Overview

- **Location**: `src/modules/admin/`
- **Protection**: `AdminGuard` required
- **Dependencies**: Most other modules

## Features

### Dashboard

- User statistics (total, active, new)
- Job statistics
- Subscription revenue
- AI usage metrics

### User Management

- List/search users
- View user details
- Update user status
- Manage subscriptions

### Job Management

- List/search jobs
- Moderate job listings
- Remove inappropriate content

### Crawler Controls

- View crawler configs
- Trigger manual crawls
- View crawl logs

### Plan Management

- CRUD subscription plans
- Update pricing/features
- Manage Stripe products

### Prompt Management

- Edit AI prompts
- Enable/disable prompts
- Test prompts

### Other Admin Features

- Moderation tools
- Support ticket handling
- Coupon management

## Controllers

| Controller                  | Endpoints           |
| --------------------------- | ------------------- |
| `AdminDashboardController`  | `/admin/dashboard`  |
| `AdminUsersController`      | `/admin/users`      |
| `AdminJobsController`       | `/admin/jobs`       |
| `AdminCrawlerController`    | `/admin/crawler`    |
| `AdminPlanController`       | `/admin/plans`      |
| `AdminPromptController`     | `/admin/prompts`    |
| `AdminAiController`         | `/admin/ai`         |
| `AdminModerationController` | `/admin/moderation` |
| `AdminSupportController`    | `/admin/support`    |
| `AdminCouponController`     | `/admin/coupons`    |

## AdminGuard

```typescript
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {}
```

Checks user role in JWT token.
