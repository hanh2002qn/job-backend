export interface EducationRecord {
  school?: string;
  degree?: string;
  major?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  [key: string]: unknown;
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
  [key: string]: unknown;
}

export interface JobAlertJob {
  title: string;
  company: string;
  location: string;
  salary?: string;
  url: string;
}
