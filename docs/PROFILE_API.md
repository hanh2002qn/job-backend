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
  "phone": "+84...",
  "address": "Ha Noi",
  "currentRole": "Backend Developer",
  "seniorityLevel": "senior",
  "yearsOfExperience": 5,
  "location": "Ha Noi, Vietnam",
  "workPreference": "remote",
  "source": "user",
  "confidence": 1.0,
  "linkedin": "https://linkedin.com/in/...",
  "portfolio": "https://...",
  "cvUrl": "https://s3.../cv.pdf",
  "cvFileName": "resume.pdf",
  "cvS3Key": "cvs/...",
  "isPublic": true,
  "visibilitySettings": {
    "showEmail": false,
    "showPhone": false,
    "showSalary": false,
    "showSocials": true
  },
  "completenessScore": 75,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Enum Values:**

- `seniorityLevel`: `"entry"` | `"junior"` | `"mid"` | `"senior"` | `"lead"` | `"manager"`
- `workPreference`: `"remote"` | `"onsite"` | `"hybrid"` | `"flexible"`
- `source`: `"user"` | `"cv_parse"` | `"ai_suggest"`

---

### 2. Update Profile

```http
PUT /api/profiles/me
```

**Request Body:**

```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "+84123456789",
  "address": "Ha Noi, Vietnam",
  "linkedin": "https://linkedin.com/in/username",
  "portfolio": "https://portfolio.com",
  "skills": ["Node.js", "React"],
  "education": [
    {
      "school": "MIT",
      "degree": "BS",
      "major": "Computer Science",
      "startDate": "2016",
      "endDate": "2020"
    }
  ],
  "experience": [
    {
      "company": "Google",
      "role": "Engineer",
      "startDate": "2020-01",
      "endDate": "2023-05",
      "description": "Built APIs..."
    }
  ],
  "preferredIndustries": ["IT", "Design"],
  "preferredJobTypes": ["Full-time", "Remote"],
  "preferredLocations": ["Hà Nội", "Hồ Chí Minh"],
  "minSalaryExpectation": 10000000
}
```

> [!NOTE]
> Tất cả fields đều optional. Chỉ gửi fields cần update.
> Các fields `skills`, `education`, `experience`, `preferredIndustries`, `preferredJobTypes`, `preferredLocations` là legacy fields, ưu tiên sử dụng các sub-entity endpoints (ProfileSkill, ProfileExperience, etc.) cho data mới.

**Response:** Updated profile object

---

### 3. Update Visibility Settings

```http
PUT /api/profiles/me/visibility
```

**Request Body:**

```json
{
  "isPublic": true,
  "visibilitySettings": {
    "showEmail": true,
    "showPhone": false,
    "showSalary": false,
    "showSocials": true
  }
}
```

> [!IMPORTANT]
> Cấu trúc là nested object với `isPublic` ở top level và `visibilitySettings` chứa các toggle. Khác với flat structure.

**Visibility Fields:**

| Field         | Type    | Default | Description                            |
| ------------- | ------- | ------- | -------------------------------------- |
| `isPublic`    | boolean | true    | Toàn bộ profile public hay private     |
| `showEmail`   | boolean | false   | Hiển thị email trong public profile    |
| `showPhone`   | boolean | false   | Hiển thị phone trong public profile    |
| `showSalary`  | boolean | false   | Hiển thị salary expectation            |
| `showSocials` | boolean | true    | Hiển thị LinkedIn & Portfolio cùng lúc |

**Response:** Updated profile object

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
    "createdAt": "2024-01-01T00:00:00Z",
    "confirmedAt": null
  }
}
```

> [!NOTE]
> `session` có thể là `undefined` nếu AI parsing thất bại. CV vẫn được upload thành công lên S3. `parsedFields.skills[].category` sử dụng `SkillCategory` enum: `"professional"` | `"technical"` | `"interpersonal"` | `"domain"` | `"language"` | `"tool"`. Low confidence threshold là `< 0.6`.

### Step 2: Review Sessions

```http
GET /api/profiles/me/cv/sessions
```

**Response:** Array of CV import sessions, sorted by `createdAt` DESC

### Step 3: Confirm Import

```http
POST /api/profiles/me/cv/confirm/:sessionId
```

> [!IMPORTANT]
> Chỉ confirm được sessions có status = `"parsed"`. Sessions đã confirmed hoặc discarded sẽ trả 400 Bad Request.

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

**Response:**

```json
{
  "message": "Session discarded successfully"
}
```

---

## 📊 Profile Completeness

### Get Completeness Score

```http
GET /api/profiles/me/completeness?targetRole=Backend Developer
```

**Query Parameters:**

- `targetRole` (optional): Role to calculate completeness for. Default: `"general"`

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

> [!NOTE]
> `readinessScore` trả về dạng 0-1 (0.75 = 75%). Kết quả `missingElements` giới hạn tối đa 10 items. Có sử dụng AI (Gemini) để analyze role-specific gaps, nên response time có thể chậm hơn bình thường.

**MissingElement Types:** `"skill"` | `"experience"` | `"project"` | `"career_intent"` | `"overview"`

---

## 💡 AI Insights

### Get Insights

```http
GET /api/profiles/me/insights?unreadOnly=true
```

**Query Parameters:**

- `unreadOnly` (optional): Filter to unread insights only. Value: `"true"` | `"false"`. Default: `false`

**Response:**

```json
[
  {
    "id": "insight-uuid",
    "profileId": "profile-uuid",
    "trigger": "skill_gap_detected",
    "insight": "Your profile is missing skills commonly required for Backend Developer: Docker, Kubernetes",
    "suggestedAction": "Consider learning Docker to improve your chances",
    "relatedProfileFields": ["skill:Docker", "skill:Kubernetes"],
    "isRead": false,
    "isActioned": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

**Insight Triggers (InsightTrigger enum):**

| Value                | Description                      |
| -------------------- | -------------------------------- |
| `cv_rejected`        | CV bị từ chối bởi nhà tuyển dụng |
| `job_saved`          | User save một job                |
| `interview_failed`   | User fail interview              |
| `profile_incomplete` | Profile không đủ thông tin       |
| `skill_gap_detected` | Phát hiện skill gap              |

> [!NOTE]
> Trigger values sử dụng **lowercase snake_case** (ví dụ: `"cv_rejected"`, không phải `"CV_REJECTED"`).

### Mark Insight as Read

```http
POST /api/profiles/me/insights/:insightId/read
```

**Response:** Updated insight object

### Mark Insight as Actioned

```http
POST /api/profiles/me/insights/:insightId/actioned
```

**Response:** Updated insight object

---

## 📸 Avatar Upload

```http
POST /api/profiles/me/avatar
Content-Type: multipart/form-data
```

**Form Data:**

- `file`: Image file (JPEG, PNG, WebP, GIF - max 5MB)

**Response:**

```json
{
  "url": "https://s3.../avatar.jpg"
}
```

> [!NOTE]
> Avatar URL được lưu vào **User entity** (`user.avatarUrl`), không phải Profile entity. Response trả về `{ url }` không phải `{ avatarUrl }`.

---

## 🔍 Public Profile

```http
GET /api/profiles/:profileId
```

**Note:** Chỉ trả về profile có `isPublic = true`. Respects visibility settings:

- Luôn hiển thị: `id`, `fullName`, `skills`, `education`, `experience`, `completenessScore`
- `showEmail` → hiện email từ User entity
- `showPhone` → hiện phone
- `showSalary` → hiện `minSalaryExpectation`
- `showSocials` → hiện `linkedin` & `portfolio`

Nếu profile private hoặc không tồn tại → 404 NotFoundException.

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

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/profiles/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

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

      return data.session; // có thể undefined nếu AI parse thất bại
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateVisibility = async (settings: {
    isPublic?: boolean;
    visibilitySettings?: {
      showEmail?: boolean;
      showPhone?: boolean;
      showSalary?: boolean;
      showSocials?: boolean;
    };
  }) => {
    try {
      setLoading(true);
      const { data } = await axios.put(`${API_BASE}/profiles/me/visibility`, settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCompleteness = async (targetRole?: string) => {
    try {
      setLoading(true);
      const params = targetRole ? { targetRole } : {};
      const { data } = await axios.get(`${API_BASE}/profiles/me/completeness`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getInsights = async (unreadOnly = false) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/profiles/me/insights`, {
        params: { unreadOnly },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
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
    updateVisibility,
    getCompleteness,
    getInsights,
  };
};
```

### CV Upload Component Example

```tsx
import { useState } from 'react';
import { useProfile } from './hooks/useProfile';

interface CvSession {
  id: string;
  parsedFields: {
    skills: Array<{ name: string; category: string; confidence: number }>;
    experiences: Array<{
      organization: string;
      role: string;
      startDate?: string;
      endDate?: string;
      confidence: number;
    }>;
    projects: Array<{ name: string; description?: string; role?: string; confidence: number }>;
  };
  lowConfidenceFields: string[];
}

export const CVUploadFlow = () => {
  const { uploadCV, confirmCVImport, loading } = useProfile();
  const [session, setSession] = useState<CvSession | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadedSession = await uploadCV(file);
    if (uploadedSession) {
      setSession(uploadedSession);
    } else {
      alert('CV uploaded but auto-parse failed. You can add info manually.');
    }
  };

  const handleConfirm = async () => {
    if (!session) return;

    const result = await confirmCVImport(session.id);
    alert(
      `Imported: ${result.skills} skills, ${result.experiences} experiences, ${result.projects} projects`,
    );
    setSession(null);
  };

  return (
    <div>
      {!session ? (
        <div>
          <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
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
                {exp.role} at {exp.organization} ({exp.startDate} - {exp.endDate})
              </li>
            ))}
          </ul>

          {session.lowConfidenceFields.length > 0 && (
            <div className="warning">
              ⚠️ Low confidence fields (below 60%): {session.lowConfidenceFields.join(', ')}
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

| Status | Meaning            | Action                                   |
| ------ | ------------------ | ---------------------------------------- |
| 400    | Validation error   | Check request body format                |
| 400    | Bad Request        | Session not in parsed state              |
| 401    | Unauthorized       | Refresh token or redirect to login       |
| 404    | Profile not found  | Profile chưa tồn tại                     |
| 404    | Profile is private | Profile đã set `isPublic = false`        |
| 413    | File too large     | Reduce file size (CV: 10MB, Avatar: 5MB) |

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
   - Highlight low-confidence fields (< 60%) for manual review
   - Handle case where `session` is `undefined` (AI parse failed)
   - Allow editing before confirmation

2. **Completeness Tracking**
   - Show completeness score on profile page
   - Display missing elements as actionable items
   - Update score in real-time after profile changes
   - Note: completeness endpoint uses AI → may have latency

3. **Insights Display**
   - Show unread insights as notifications (`unreadOnly=true`)
   - Mark as actioned when user takes the suggested action
   - Trigger values are lowercase snake_case

4. **Visibility Settings**
   - `isPublic` controls entire profile visibility
   - `showSocials` controls both LinkedIn & Portfolio together
   - No separate toggle for LinkedIn vs Portfolio

5. **Performance**
   - Cache profile data in local state
   - Debounce auto-save on profile updates
   - Use optimistic UI updates

---

## 📝 TypeScript Types

```typescript
// ============ Enums ============

export enum SeniorityLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  MANAGER = 'manager',
}

export enum WorkMode {
  REMOTE = 'remote',
  ONSITE = 'onsite',
  HYBRID = 'hybrid',
  FLEXIBLE = 'flexible',
}

export enum DataSource {
  USER = 'user',
  CV_PARSE = 'cv_parse',
  AI_SUGGEST = 'ai_suggest',
}

export enum SkillCategory {
  PROFESSIONAL = 'professional',
  TECHNICAL = 'technical',
  INTERPERSONAL = 'interpersonal',
  DOMAIN = 'domain',
  LANGUAGE = 'language',
  TOOL = 'tool',
}

export enum ImportStatus {
  PARSED = 'parsed',
  CONFIRMED = 'confirmed',
  DISCARDED = 'discarded',
}

export enum InsightTrigger {
  CV_REJECTED = 'cv_rejected',
  JOB_SAVED = 'job_saved',
  INTERVIEW_FAILED = 'interview_failed',
  PROFILE_INCOMPLETE = 'profile_incomplete',
  SKILL_GAP_DETECTED = 'skill_gap_detected',
}

// ============ Core Types ============

export interface VisibilitySettings {
  showEmail: boolean;
  showPhone: boolean;
  showSalary: boolean;
  showSocials: boolean;
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string | null;
  phone: string | null;
  address: string | null;
  currentRole: string | null;
  seniorityLevel: SeniorityLevel | null;
  yearsOfExperience: number | null;
  location: string | null;
  workPreference: WorkMode | null;
  source: DataSource;
  confidence: number;
  linkedin: string | null;
  portfolio: string | null;
  cvUrl: string | null;
  cvFileName: string | null;
  cvS3Key: string | null;
  isPublic: boolean;
  visibilitySettings: VisibilitySettings;
  completenessScore: number;
  createdAt: string;
  updatedAt: string;
}

// ============ CV Import Types ============

export interface ParsedFields {
  skills: ParsedSkill[];
  experiences: ParsedExperience[];
  projects: ParsedProject[];
}

export interface ParsedSkill {
  name: string;
  category?: SkillCategory;
  confidence: number;
}

export interface ParsedExperience {
  organization: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  confidence: number;
}

export interface ParsedProject {
  name: string;
  description?: string;
  role?: string;
  confidence: number;
}

export interface CvImportSession {
  id: string;
  profileId: string;
  rawText: string;
  parsedFields: ParsedFields;
  lowConfidenceFields: string[];
  status: ImportStatus;
  createdAt: string;
  confirmedAt: string | null;
}

// ============ Completeness Types ============

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

// ============ Insight Types ============

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

// ============ Request DTOs ============

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  portfolio?: string;
  skills?: string[];
  education?: EducationRecord[];
  experience?: ExperienceRecord[];
  preferredIndustries?: string[];
  preferredJobTypes?: string[];
  preferredLocations?: string[];
  minSalaryExpectation?: number;
}

export interface UpdateVisibilityRequest {
  isPublic?: boolean;
  visibilitySettings?: Partial<VisibilitySettings>;
}

export interface EducationRecord {
  school?: string;
  degree?: string;
  major?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ExperienceRecord {
  company?: string;
  role?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  achievements?: string[];
  years?: number;
}
```

---

## 📚 Endpoint Summary

| Method | Endpoint                                 | Description                      |
| ------ | ---------------------------------------- | -------------------------------- |
| GET    | `/api/profiles/me`                       | Lấy profile user hiện tại        |
| PUT    | `/api/profiles/me`                       | Cập nhật profile                 |
| PUT    | `/api/profiles/me/visibility`            | Cập nhật visibility settings     |
| POST   | `/api/profiles/me/cv`                    | Upload CV (multipart/form-data)  |
| GET    | `/api/profiles/me/cv/sessions`           | Lấy danh sách CV import sessions |
| POST   | `/api/profiles/me/cv/confirm/:sessionId` | Confirm CV import session        |
| POST   | `/api/profiles/me/cv/discard/:sessionId` | Discard CV import session        |
| GET    | `/api/profiles/me/completeness`          | Lấy completeness score           |
| GET    | `/api/profiles/me/insights`              | Lấy AI insights                  |
| POST   | `/api/profiles/me/insights/:id/read`     | Đánh dấu insight đã đọc          |
| POST   | `/api/profiles/me/insights/:id/actioned` | Đánh dấu insight đã xử lý        |
| POST   | `/api/profiles/me/avatar`                | Upload avatar (multipart)        |
| GET    | `/api/profiles/:profileId`               | Lấy public profile               |
