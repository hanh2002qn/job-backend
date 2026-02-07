# Jobs Module

Job listings management and crawler.

## Overview

### Jobs Module

- **Location**: `src/modules/jobs/`
- **Entities**: `Job`, `SavedJob`

### Job Crawler Module

- **Location**: `src/modules/job-crawler/`
- **Purpose**: Automated job crawling from external sources

## Job Entity

```typescript
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  jobType: string; // full-time, part-time, contract
  experienceLevel: string;
  postedAt: Date;
  source: string; // linkedin, indeed, etc.
  sourceUrl: string;
  isActive: boolean;
}
```

## Features

### Job Search & Filtering

- Pagination with cursor/offset
- Filter by: location, job type, experience, salary range
- Full-text search on title/description
- Sort by: date, relevance

### Saved Jobs

- Users can bookmark jobs
- `SavedJob` links `User` to `Job`

### Job Crawler (Worker)

- Runs on scheduled intervals via worker app
- Configurable crawler settings per source
- Logs crawl results in `CrawlLog`

## Key Files

**Jobs Module:**
| File | Purpose |
|------|---------|
| `jobs.controller.ts` | Job CRUD endpoints |
| `jobs.service.ts` | Job business logic |
| `entities/job.entity.ts` | Job entity |
| `entities/saved-job.entity.ts` | Saved job entity |

**Crawler Module:**
| File | Purpose |
|------|---------|
| `job-crawler.service.ts` | Crawling logic |
| `entities/crawler-config.entity.ts` | Crawler settings |
| `entities/crawl-log.entity.ts` | Crawl history |

## API Endpoints

```
GET    /jobs              # List jobs
GET    /jobs/:id          # Get job
POST   /jobs/saved        # Save job
GET    /jobs/saved        # List saved
DELETE /jobs/saved/:id    # Unsave job
```

## Admin Crawler Controls

```
POST   /admin/crawler/run        # Manual trigger
GET    /admin/crawler/configs    # List configs
PATCH  /admin/crawler/configs/:id # Update config
```
