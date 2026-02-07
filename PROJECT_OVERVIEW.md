# AI Job Backend - Project Overview

Nền tảng hỗ trợ tìm kiếm việc làm với các tính năng AI-powered như matching, mock interview, và skill roadmap.

## Tech Stack

| Category    | Technology                          |
| ----------- | ----------------------------------- |
| Framework   | NestJS (TypeScript)                 |
| Database    | PostgreSQL + TypeORM                |
| Cache/Queue | Redis                               |
| AI          | Google Gemini                       |
| Payment     | Stripe                              |
| Storage     | AWS S3                              |
| Auth        | JWT + OAuth (Google, GitHub, Apple) |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Main App                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  Auth   │ │  Jobs   │ │   CV    │ │ Tracker │  ...      │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│       └───────────┴───────────┴───────────┘                 │
│                         │                                    │
│              ┌──────────┴──────────┐                        │
│              │    AI Module        │                        │
│              │  (Gemini Service)   │                        │
│              └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
    ┌────┴────┐         ┌────┴────┐         ┌────┴────┐
    │PostgreSQL│         │  Redis  │         │   S3    │
    └─────────┘         └─────────┘         └─────────┘
```

Worker App runs background jobs (cron, job crawling) separately.

## Module Summary

### Core Modules

| Module        | Description                | Key Entities                      |
| ------------- | -------------------------- | --------------------------------- |
| `auth`        | JWT + OAuth authentication | -                                 |
| `users`       | User management & credits  | `User`, `UserCredits`             |
| `profiles`    | User profile với skills    | `Profile`                         |
| `jobs`        | Job listings & saved jobs  | `Job`, `SavedJob`                 |
| `job-crawler` | Automated job crawling     | `CrawlerConfig`, `CrawlLog`       |
| `tracker`     | Application tracking       | `JobTracker`, `InterviewSchedule` |

### AI-Powered Features

| Module           | Description                | Credits |
| ---------------- | -------------------------- | ------- |
| `matching`       | AI job matching score      | ✓       |
| `mock-interview` | AI interview simulation    | ✓       |
| `skill-roadmap`  | Personalized learning path | ✓       |
| `cv`             | CV tailoring & PDF export  | ✓       |

### Business Modules

| Module          | Description                     |
| --------------- | ------------------------------- |
| `subscription`  | Plans, Stripe payments, credits |
| `admin`         | Dashboard, user/job management  |
| `notifications` | In-app notifications            |
| `analytics`     | User activity analytics         |
| `mail`          | Email service (Nodemailer)      |

## Directory Structure

```
src/
├── app.module.ts           # Main module imports
├── worker.module.ts        # Background worker
├── main.ts                 # App entry point
├── worker.ts               # Worker entry point
├── common/                 # Shared utilities
│   ├── decorators/         # @CurrentUser, @Public
│   ├── guards/             # JwtAuthGuard, RolesGuard, AdminGuard
│   ├── redis/              # Redis module
│   └── services/           # S3Service, FileUpload
├── config/                 # TypeORM config
├── database/               # Migrations
├── modules/                # Feature modules (22 total)
└── processors/             # Bull queue processors
```

## Quick Links

- [Development Guide](./DEVELOPMENT.md)
- [Architecture Details](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Module Docs](./docs/modules/)

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/aijob

# Auth
JWT_SECRET=your-secret
JWT_EXPIRATION=1d

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_TEAM_ID=

# AI & Services
GEMINI_API_KEY=
STRIPE_SECRET_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```
