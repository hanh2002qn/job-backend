# API Reference

Quick reference for all API endpoints. All endpoints require `Authorization: Bearer <token>` unless marked `[Public]`.

## Authentication

| Method | Endpoint                | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| POST   | `/auth/register`        | Register new user `[Public]`         |
| POST   | `/auth/login`           | Login with email/password `[Public]` |
| GET    | `/auth/google`          | Google OAuth login `[Public]`        |
| GET    | `/auth/github`          | GitHub OAuth login `[Public]`        |
| GET    | `/auth/apple`           | Apple OAuth login `[Public]`         |
| POST   | `/auth/forgot-password` | Request password reset `[Public]`    |
| POST   | `/auth/reset-password`  | Reset password with token `[Public]` |
| GET    | `/auth/profile`         | Get current user profile             |
| POST   | `/auth/change-password` | Change password                      |

## Users

| Method | Endpoint         | Description            |
| ------ | ---------------- | ---------------------- |
| GET    | `/users/me`      | Get current user       |
| PATCH  | `/users/me`      | Update current user    |
| GET    | `/users/credits` | Get AI credits balance |

## Profiles

| Method | Endpoint                  | Description         |
| ------ | ------------------------- | ------------------- |
| GET    | `/profiles`               | Get user profile    |
| POST   | `/profiles`               | Create profile      |
| PATCH  | `/profiles`               | Update profile      |
| POST   | `/profiles/upload-avatar` | Upload avatar image |
| POST   | `/profiles/parse-resume`  | Parse resume (AI)   |

## Jobs

| Method | Endpoint          | Description                       |
| ------ | ----------------- | --------------------------------- |
| GET    | `/jobs`           | List jobs (paginated, filterable) |
| GET    | `/jobs/:id`       | Get job details                   |
| POST   | `/jobs/saved`     | Save a job                        |
| GET    | `/jobs/saved`     | Get saved jobs                    |
| DELETE | `/jobs/saved/:id` | Remove saved job                  |

## CV Management

| Method | Endpoint             | Description                         |
| ------ | -------------------- | ----------------------------------- |
| GET    | `/cv`                | List user CVs                       |
| POST   | `/cv`                | Create new CV                       |
| GET    | `/cv/:id`            | Get CV details                      |
| PATCH  | `/cv/:id`            | Update CV                           |
| DELETE | `/cv/:id`            | Delete CV                           |
| POST   | `/cv/:id/tailor`     | AI tailor CV for job (uses credits) |
| GET    | `/cv/:id/export/pdf` | Export CV as PDF                    |
| GET    | `/cv/:id/versions`   | Get CV versions                     |

## Cover Letters

| Method | Endpoint            | Description         |
| ------ | ------------------- | ------------------- |
| GET    | `/cover-letter`     | List cover letters  |
| POST   | `/cover-letter`     | Create cover letter |
| GET    | `/cover-letter/:id` | Get cover letter    |
| PATCH  | `/cover-letter/:id` | Update cover letter |
| DELETE | `/cover-letter/:id` | Delete cover letter |

## Job Tracker

| Method | Endpoint                 | Description                     |
| ------ | ------------------------ | ------------------------------- |
| GET    | `/tracker`               | List tracked applications       |
| POST   | `/tracker`               | Add application to tracker      |
| PATCH  | `/tracker/:id`           | Update application status       |
| DELETE | `/tracker/:id`           | Remove from tracker             |
| POST   | `/tracker/:id/interview` | Schedule interview              |
| GET    | `/tracker/:id/prep-tips` | Get AI prep tips (uses credits) |

## AI Features

### Matching

| Method | Endpoint                    | Description                          |
| ------ | --------------------------- | ------------------------------------ |
| POST   | `/matching/score`           | Get AI matching score (uses credits) |
| GET    | `/matching/recommendations` | Get job recommendations              |

### Mock Interview

| Method | Endpoint                      | Description                         |
| ------ | ----------------------------- | ----------------------------------- |
| POST   | `/mock-interview`             | Start mock interview (uses credits) |
| GET    | `/mock-interview`             | List mock interviews                |
| GET    | `/mock-interview/:id`         | Get interview details               |
| POST   | `/mock-interview/:id/message` | Send message in interview           |

### Skill Roadmap

| Method | Endpoint             | Description                           |
| ------ | -------------------- | ------------------------------------- |
| POST   | `/skill-roadmap`     | Generate skill roadmap (uses credits) |
| GET    | `/skill-roadmap`     | List roadmaps                         |
| GET    | `/skill-roadmap/:id` | Get roadmap details                   |

## Subscription

| Method | Endpoint                 | Description                    |
| ------ | ------------------------ | ------------------------------ |
| GET    | `/subscription`          | Get current subscription       |
| GET    | `/subscription/plans`    | List available plans           |
| POST   | `/subscription/checkout` | Create Stripe checkout session |
| POST   | `/subscription/webhook`  | Stripe webhook `[Public]`      |
| POST   | `/subscription/cancel`   | Cancel subscription            |

## Notifications

| Method | Endpoint                  | Description         |
| ------ | ------------------------- | ------------------- |
| GET    | `/notifications`          | List notifications  |
| PATCH  | `/notifications/:id/read` | Mark as read        |
| POST   | `/notifications/read-all` | Mark all as read    |
| DELETE | `/notifications/:id`      | Delete notification |

## Admin Endpoints

All admin endpoints require `AdminGuard`. Base path: `/admin`

| Method | Endpoint             | Description     |
| ------ | -------------------- | --------------- |
| GET    | `/admin/dashboard`   | Dashboard stats |
| GET    | `/admin/users`       | List users      |
| PATCH  | `/admin/users/:id`   | Update user     |
| GET    | `/admin/jobs`        | List jobs       |
| POST   | `/admin/crawler/run` | Trigger crawler |
| GET    | `/admin/plans`       | List plans      |
| POST   | `/admin/plans`       | Create plan     |
| GET    | `/admin/prompts`     | List AI prompts |
| PATCH  | `/admin/prompts/:id` | Update prompt   |
