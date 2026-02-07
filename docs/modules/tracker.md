# Tracker Module

Job application tracking with interview scheduling.

## Overview

- **Location**: `src/modules/tracker/`
- **Entities**: `JobTracker`, `InterviewSchedule`, `TrackerNote`
- **Dependencies**: `JobsModule`, `SubscriptionModule`, `MailModule`, `AIModule`

## Features

### Application Tracking

- Track job applications by status
- Status flow: applied → screening → interview → offer → accepted/rejected
- Link to job listing and CV used

### Interview Scheduling

- Schedule interview dates
- Google Calendar integration
- Email reminders

### AI Prep Tips

- Get interview preparation tips
- Based on job requirements and user profile
- Uses AI credits

## Entity Structure

```typescript
interface JobTracker {
  id: string;
  userId: string;
  jobId: string;
  cvId?: string;
  status: ApplicationStatus;
  appliedAt: Date;
  notes: TrackerNote[];
  interviews: InterviewSchedule[];
}

enum ApplicationStatus {
  APPLIED = 'applied',
  SCREENING = 'screening',
  INTERVIEW = 'interview',
  OFFER = 'offer',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}
```

## Key Services

| Service                 | Purpose                    |
| ----------------------- | -------------------------- |
| `TrackerService`        | Application tracking logic |
| `GoogleCalendarService` | Calendar integration       |

## API Endpoints

```
GET    /tracker              # List tracked applications
POST   /tracker              # Add to tracker
GET    /tracker/:id          # Get application details
PATCH  /tracker/:id          # Update status
DELETE /tracker/:id          # Remove from tracker
POST   /tracker/:id/interview   # Schedule interview
PATCH  /tracker/:id/interview/:iid  # Update interview
GET    /tracker/:id/prep-tips    # AI prep tips (credits)
POST   /tracker/:id/notes        # Add note
```

## Google Calendar Integration

Requires OAuth tokens for Google Calendar API:

- Creates calendar events for interviews
- Syncs interview updates

## Credit Usage

| Action           | Credits               |
| ---------------- | --------------------- |
| Get AI Prep Tips | Configurable per plan |
