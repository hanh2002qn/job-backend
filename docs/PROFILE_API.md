# Profile API Documentation - Frontend Integration Guide

## 📋 Tổng Quan

Profile API quản lý Career Intelligence Profile của user, bao gồm CV upload, skill tracking, experience management, và AI-driven insights.

**Base URL:** `/api/profiles`

**Authentication:** Tất cả endpoints cần JWT token qua `Authorization: Bearer <token>`

---

## 🔐 Authentication

Tất cả requests cần header:

```http
Authorization: Bearer <jwt_access_token>
```

---

## 📌 Core Endpoints

### 1. Get Current User Profile

```http
GET /api/profiles/me
```

**Response:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "fullName": "Nguyễn Văn A",
  "currentRole": "Backend Developer",
  "seniorityLevel": "senior",
  "yearsOfExperience": 5,
  "phone": "+84...",
  "address": "Ha Noi",
  "linkedin": "https://linkedin.com/in/...",
  "portfolio": "https://...",
  "cvUrl": "https://s3.../cv.pdf",
  "cvFileName": "resume.pdf",
  "completenessScore": 0.85,
  "visibility": {
    "showEmail": true,
    "showPhone": false,
    "showAddress": false
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

### 2. Update Profile

```http
PUT /api/profiles/me
```

**Request Body:**

```json
{
  "fullName": "Nguyễn Văn A",
  "currentRole": "Senior Backend Developer",
  "seniorityLevel": "senior",
  "yearsOfExperience": 5,
  "phone": "+84123456789",
  "address": "Ha Noi, Vietnam",
  "linkedin": "https://linkedin.com/in/username",
  "portfolio": "https://portfolio.com"
}
```

**Response:** Updated profile object

---

### 3. Update Visibility Settings

```http
PUT /api/profiles/me/visibility
```

**Request Body:**

```json
{
  "showEmail": true,
  "showPhone": false,
  "showAddress": false,
  "showLinkedin": true,
  "showPortfolio": true
}
```

---

## 📄 CV Upload Flow

### Step 1: Upload CV File

```http
POST /api/profiles/me/cv
Content-Type: multipart/form-data
```

**Form Data:**

- `file`: PDF, DOC, DOCX, or TXT file (max 10MB)

**Response:**

```json
{
  "url": "https://s3.../cv.pdf",
  "session": {
    "id": "session-uuid",
    "profileId": "profile-uuid",
    "rawText": "CV content...",
    "parsedFields": {
      "skills": [
        {
          "name": "Node.js",
          "category": "technical",
          "confidence": 0.95
        }
      ],
      "experiences": [
        {
          "organization": "Tech Corp",
          "role": "Backend Developer",
          "startDate": "2020-01",
          "endDate": "2023-05",
          "description": "Built APIs...",
          "confidence": 0.9
        }
      ],
      "projects": [
        {
          "name": "E-commerce Platform",
          "description": "Built...",
          "role": "Lead Developer",
          "confidence": 0.85
        }
      ]
    },
    "lowConfidenceFields": ["experiences[2]", "projects[0]"],
    "status": "parsed",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Step 2: Review Sessions

```http
GET /api/profiles/me/cv/sessions
```

**Response:** Array of CV import sessions

### Step 3: Confirm Import

```http
POST /api/profiles/me/cv/confirm/:sessionId
```

**Response:**

```json
{
  "skills": 5,
  "experiences": 3,
  "projects": 2
}
```

### Step 4: Discard Session (Optional)

```http
POST /api/profiles/me/cv/discard/:sessionId
```

---

## 📊 Profile Completeness

### Get Completeness Score

```http
GET /api/profiles/me/completeness?targetRole=Backend Developer
```

**Query Parameters:**

- `targetRole` (optional): Role to calculate completeness for. Default: "general"

**Response:**

```json
{
  "targetRole": "Backend Developer",
  "readinessScore": 0.75,
  "missingElements": [
    {
      "type": "skill",
      "description": "Missing key skill: Docker",
      "priority": "high"
    },
    {
      "type": "experience",
      "description": "Experience entries lack impact/metrics",
      "priority": "medium"
    },
    {
      "type": "career_intent",
      "description": "No target roles set",
      "priority": "medium"
    }
  ]
}
```

---

## 💡 AI Insights

### Get Insights

```http
GET /api/profiles/me/insights?unreadOnly=true
```

**Query Parameters:**

- `unreadOnly` (optional): Filter to unread insights only. Default: false

**Response:**

```json
[
  {
    "id": "insight-uuid",
    "profileId": "profile-uuid",
    "trigger": "CV_REJECTED",
    "insight": "Your profile is missing skills commonly required for Backend Developer: Docker, Kubernetes",
    "suggestedAction": "Consider learning Docker to improve your chances",
    "relatedProfileFields": ["skill:Docker", "skill:Kubernetes"],
    "isRead": false,
    "isActioned": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

**Insight Triggers:**

- `CV_REJECTED`
- `JOB_SAVED`
- `INTERVIEW_FAILED`
- `LOW_MATCH_SCORE`
- `PROFILE_VIEWED`
- `SKILL_GAP_DETECTED`
- `PROFILE_INCOMPLETE`

### Mark Insight as Read

```http
POST /api/profiles/me/insights/:insightId/read
```

### Mark Insight as Actioned

```http
POST /api/profiles/me/insights/:insightId/actioned
```

---

## 📸 Avatar Upload

```http
POST /api/profiles/me/avatar
Content-Type: multipart/form-data
```

**Form Data:**

- `file`: Image file (JPG, PNG, max 5MB)

**Response:**

```json
{
  "avatarUrl": "https://s3.../avatar.jpg"
}
```

---

## 🔍 Public Profile

```http
GET /api/profiles/:profileId
```

**Note:** Respects visibility settings. Only public fields are returned.

---

## 🎯 Complete Integration Example

### React Hook Example

```typescript
import { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current profile
  const getProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/profiles/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload CV with confirmation flow
  const uploadCV = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await axios.post(`${API_BASE}/profiles/me/cv`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Return session for user review
      return data.session;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Confirm CV import
  const confirmCVImport = async (sessionId: string) => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${API_BASE}/profiles/me/cv/confirm/${sessionId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      );
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get completeness for a target role
  const getCompleteness = async (targetRole?: string) => {
    try {
      setLoading(true);
      const params = targetRole ? { targetRole } : {};
      const { data } = await axios.get(`${API_BASE}/profiles/me/completeness`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get AI insights
  const getInsights = async (unreadOnly = false) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/profiles/me/insights`, {
        params: { unreadOnly },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getProfile,
    uploadCV,
    confirmCVImport,
    getCompleteness,
    getInsights,
  };
};
```

### CV Upload Component Example

```tsx
import { useState } from 'react';
import { useProfile } from './hooks/useProfile';

export const CVUploadFlow = () => {
  const { uploadCV, confirmCVImport, loading } = useProfile();
  const [session, setSession] = useState(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadedSession = await uploadCV(file);
    setSession(uploadedSession);
  };

  const handleConfirm = async () => {
    if (!session) return;

    const result = await confirmCVImport(session.id);
    alert(`Imported: ${result.skills} skills, ${result.experiences} experiences`);
    setSession(null);
  };

  return (
    <div>
      {!session ? (
        <div>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
        </div>
      ) : (
        <div>
          <h3>Review Parsed Data</h3>

          <h4>Skills ({session.parsedFields.skills.length})</h4>
          <ul>
            {session.parsedFields.skills.map((skill, i) => (
              <li key={i}>
                {skill.name} ({skill.category}) - Confidence: {(skill.confidence * 100).toFixed(0)}%
              </li>
            ))}
          </ul>

          <h4>Experiences ({session.parsedFields.experiences.length})</h4>
          <ul>
            {session.parsedFields.experiences.map((exp, i) => (
              <li key={i}>
                {exp.role} at {exp.organization}({exp.startDate} - {exp.endDate})
              </li>
            ))}
          </ul>

          {session.lowConfidenceFields.length > 0 && (
            <div className="warning">
              Low confidence fields: {session.lowConfidenceFields.join(', ')}
            </div>
          )}

          <button onClick={handleConfirm} disabled={loading}>
            Confirm Import
          </button>
          <button onClick={() => setSession(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};
```

---

## ⚠️ Error Handling

### Common Error Codes

| Status | Meaning           | Action                             |
| ------ | ----------------- | ---------------------------------- |
| 401    | Unauthorized      | Refresh token or redirect to login |
| 404    | Profile not found | Create profile first               |
| 400    | Validation error  | Check request body format          |
| 413    | File too large    | Reduce file size (max 10MB)        |

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## 🚀 Best Practices

1. **CV Upload Flow**
   - Always show user the parsed data before confirming
   - Highlight low-confidence fields for manual review
   - Allow editing before confirmation

2. **Completeness Tracking**
   - Show completeness score on profile page
   - Display missing elements as actionable items
   - Update score in real-time after profile changes

3. **Insights Display**
   - Show unread insights as notifications
   - Group by priority (high → medium → low)
   - Mark as actioned when user takes the suggested action

4. **Performance**
   - Cache profile data in local state
   - Debounce auto-save on profile updates
   - Use optimistic UI updates

---

## 📝 TypeScript Types

```typescript
export interface Profile {
  id: string;
  userId: string;
  fullName: string | null;
  currentRole: string | null;
  seniorityLevel: string | null;
  yearsOfExperience: number | null;
  phone: string | null;
  address: string | null;
  linkedin: string | null;
  portfolio: string | null;
  cvUrl: string | null;
  cvFileName: string | null;
  completenessScore: number;
  visibility: VisibilitySettings;
  createdAt: string;
  updatedAt: string;
}

export interface VisibilitySettings {
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showLinkedin: boolean;
  showPortfolio: boolean;
}

export interface CvImportSession {
  id: string;
  profileId: string;
  rawText: string;
  parsedFields: ParsedFields;
  lowConfidenceFields: string[];
  status: 'parsed' | 'confirmed' | 'discarded';
  createdAt: string;
  confirmedAt?: string;
}

export interface ParsedFields {
  skills: ParsedSkill[];
  experiences: ParsedExperience[];
  projects: ParsedProject[];
}

export interface CompletenessResult {
  targetRole: string;
  readinessScore: number;
  missingElements: MissingElement[];
}

export interface MissingElement {
  type: 'skill' | 'experience' | 'project' | 'career_intent' | 'overview';
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ProfileInsight {
  id: string;
  profileId: string;
  trigger: InsightTrigger;
  insight: string;
  suggestedAction: string;
  relatedProfileFields: string[];
  isRead: boolean;
  isActioned: boolean;
  createdAt: string;
}

export type InsightTrigger =
  | 'CV_REJECTED'
  | 'JOB_SAVED'
  | 'INTERVIEW_FAILED'
  | 'LOW_MATCH_SCORE'
  | 'PROFILE_VIEWED'
  | 'SKILL_GAP_DETECTED'
  | 'PROFILE_INCOMPLETE';
```
