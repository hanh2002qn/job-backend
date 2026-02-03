import { EducationRecord, ExperienceRecord } from '../../profiles/interfaces/profile.interface';

export interface CvPersonalInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  portfolio?: string;
  [key: string]: unknown;
}

export interface CvContent {
  personalInfo?: CvPersonalInfo;
  summary?: string;
  experience?: (ExperienceRecord & { achievements?: string[] })[];
  education?: EducationRecord[];
  skills?: string[];
  matchedKeywords?: string[];
  [key: string]: unknown;
}
