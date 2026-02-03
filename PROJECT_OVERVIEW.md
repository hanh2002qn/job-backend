# Project Overview: AI-Job Backend

> **Context for AI Agents**: This document provides a high-level understanding of the AI-Job Backend architecture, business logic, and key features. Use this to orient yourself before making changes.

## 1. Project Purpose

**AI-Job** is an intelligent career platform designed to automate and enhance the job search process using Generative AI. It helps users from the initial application stage down to the final offer.

**Key Value Propositions:**

- **Automated Tracking**: One-click job saving from any external site.
- **AI Personalization**: Tailoring CVs and Cover Letters for specific JDs.
- **AI Coaching**: Mock interviews and personalized skill roadmaps.

## 2. Technology Stack

### Core Frameworks

- **Runtime**: Node.js
- **Framework**: NestJS (Modular architecture)
- **Language**: TypeScript (Strict mode)

### Data & Infrastructure

- **Database**: PostgreSQL (via TypeORM)
- **Caching & Queues**: Redis (BullMQ for background jobs)
- **AI Service**: Google Gemini Pro (`@google/generative-ai`)

### Key Libraries

- **Validation**: `class-validator`, `class-transformer`
- **Documentation**: Swagger (`@nestjs/swagger`)
- **Scheduling**: `@nestjs/schedule`

## 3. Architecture & Module Structure

The project follows a **Modular Monolith** architecture. Key modules include:

### Core Modules

- **`AIModule`**: Wraps the `GeminiService`. Central hub for all LLM interactions.
- **`UsersModule` / `AuthModule`**: User management, JWT authentication (Access/Refresh tokens).
- **`JobsModule`**: Job aggregation, crawling logic, and job search.

### Feature Modules (The "AI Features Pack")

1.  **`MockInterviewModule`** (`/modules/mock-interview`)
    - **Function**: Simulates a chat-based interview.
    - **Entities**: `MockInterview`, `InterviewMessage`.
    - **AI**: Generates questions, evaluates answers, and provides a final score.

2.  **`CvModule`** (`/modules/cv`)
    - **Function**: Manages CVs and generates tailored content.
    - **Key Endpoint**: `POST /cv/:id/tailor` - Re-writes CV summary/achievements to match a specific Job Description.

3.  **`SkillRoadmapModule`** (`/modules/skill-roadmap`)
    - **Function**: Generates career learning paths.
    - **AI**: Performs "Gap Analysis" between User Profile vs. Target Goal -> Outputs a structured learning plan.

4.  **`TrackerModule`** (`/modules/tracker`)
    - **Function**: Kanban-style job application tracking.
    - **Entities**: `JobTracker`, `InterviewSchedule`.
    - **Key Features**:
      - **Unified Calendar**: Syncs all interviews.
      - **AI Prep Tips**: `getInterviewPrepTips` provides specific advice for scheduled interviews.

5.  **`ExtensionModule`** (`/modules/extension`)
    - **Function**: Backend support for the Chrome Extension.
    - **AI**: `extractJob` endpoint parses raw HTML/Text from any job site into structured data (Title, Salary, Skills).

## 4. Key Entities & Relationships

```mermaid
erDiagram
    User ||--|| Profile : has
    User ||--o{ JobTracker : tracks
    User ||--o{ CV : owns
    User ||--o{ SkillRoadmap : generates

    JobTracker }|--|| Job : references(optional)
    JobTracker ||--o{ InterviewSchedule : includes

    JobTracker }|--|| CV : submitted_with
```

## 5. Development Guidelines

- **AI Integration**: Always use `GeminiService.generateJson<T>()` for structured outputs.
- **Queueing**: Use BullMQ for long-running tasks (e.g., crawling, heavy AI generation).
- **Environment**: Ensure `GEMINI_API_KEY` and `REDIS_URL` are set.

## 6. Recent Updates (AI Features Pack)

_Completed as of Feb 2026_

- [x] **AI Mock Interview**: Interactive chat with scoring.
- [x] **CV Tailoring**: Context-aware content generation.
- [x] **Skill Roadmap**: Personalized career pathing.
- [x] **One-Click Tracker**: AI parsing for extension.
- [x] **Interview Calendar**: Schedule management & prep tips.
