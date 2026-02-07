# CV & Cover Letter Module

Resume management, tailoring, and export.

## Overview

### CV Module

- **Location**: `src/modules/cv/`
- **Entities**: `CV`, `CvVersion`
- **Dependencies**: `JobsModule`, `ProfilesModule`, `SubscriptionModule`, `AIModule`

### Cover Letter Module

- **Location**: `src/modules/cover-letter/`
- **Entity**: `CoverLetter`

## Features

### CV Management

- Create/edit multiple CVs
- Version history tracking
- PDF export with customizable templates

### AI CV Tailoring

- Tailor CV content for specific jobs
- Uses AI credits from subscription
- Highlights relevant skills/experience

### Cover Letter Generation

- Generate cover letters for job applications
- Based on CV and job description

## Key Services

| Service              | Purpose                  |
| -------------------- | ------------------------ |
| `CvService`          | CV CRUD, tailoring logic |
| `PdfService`         | PDF generation           |
| `CvRendererService`  | Template rendering       |
| `CoverLetterService` | Cover letter logic       |

## CV Entity Structure

```typescript
interface CV {
  id: string;
  userId: string;
  title: string;
  template: string;
  content: {
    personalInfo: {...};
    summary: string;
    experience: [...];
    education: [...];
    skills: [...];
  };
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

```
# CV
GET    /cv              # List CVs
POST   /cv              # Create CV
GET    /cv/:id          # Get CV
PATCH  /cv/:id          # Update CV
DELETE /cv/:id          # Delete CV
POST   /cv/:id/tailor   # AI tailor (credits)
GET    /cv/:id/export/pdf  # Export PDF
GET    /cv/:id/versions # Version history

# Cover Letter
GET    /cover-letter        # List
POST   /cover-letter        # Create
GET    /cover-letter/:id    # Get
PATCH  /cover-letter/:id    # Update
DELETE /cover-letter/:id    # Delete
```

## Credit Usage

| Action    | Credits               |
| --------- | --------------------- |
| Tailor CV | Configurable per plan |
