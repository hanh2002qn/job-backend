# AI Features Module

AI-powered features using Google Gemini.

## Overview

### AIModule (Global)

- **Location**: `src/modules/ai/`
- **Service**: `GeminiService` - shared AI service
- **Entities**: `Prompt`, `AiUsage`

### AI Feature Modules

| Module         | Location                      | Purpose                  |
| -------------- | ----------------------------- | ------------------------ |
| Matching       | `src/modules/matching/`       | Job-candidate matching   |
| Mock Interview | `src/modules/mock-interview/` | AI interview simulation  |
| Skill Roadmap  | `src/modules/skill-roadmap/`  | Learning path generation |

## GeminiService

Central service for all AI calls:

- Prompt management from database
- Usage logging
- Error handling

```typescript
class GeminiService {
  async generateContent(promptKey: string, variables: object): Promise<string>;
  async chatCompletion(messages: Message[]): Promise<string>;
}
```

## Prompt System

Prompts stored in database, editable via admin:

```typescript
interface Prompt {
  id: string;
  key: string; // 'cv_tailor', 'mock_interview', etc
  template: string; // Template with {{variables}}
  systemInstruction: string;
  isActive: boolean;
}
```

## Feature Details

### Job Matching

- Analyzes job requirements vs user profile
- Returns match score (0-100) and breakdown
- Considers: skills, experience, location

```
POST /matching/score
Body: { jobId: string }
Response: { score: number, breakdown: {...} }
```

### Mock Interview

- AI-powered interview simulation
- Based on job role and requirements
- Conversational back-and-forth
- Provides feedback and suggestions

```
POST /mock-interview
Body: { jobId: string }

POST /mock-interview/:id/message
Body: { content: string }
Response: { reply: string, feedback?: string }
```

### Skill Roadmap

- Generates personalized learning path
- Based on target job and current skills
- Includes resources and milestones

```
POST /skill-roadmap
Body: { jobId: string }
Response: { roadmap: { phases: [...], resources: [...] } }
```

## Credit Usage

All AI features deduct from user's credit balance:

| Feature                | Credits |
| ---------------------- | ------- |
| Job Matching           | 1       |
| CV Tailoring           | 2       |
| Mock Interview (start) | 5       |
| Skill Roadmap          | 3       |
| Prep Tips              | 1       |

## AI Security

- System instructions prevent prompt injection
- User input wrapped in delimiters
- Response validation
- Rate limiting via subscription

## Configuration

```bash
GEMINI_API_KEY=your-gemini-api-key
```
