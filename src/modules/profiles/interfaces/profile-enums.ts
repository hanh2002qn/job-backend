/**
 * Shared enums and types for Profile module entities
 * Following the Career Intelligence Profile spec
 */

// Data source tracking
export enum DataSource {
  USER = 'user',
  CV_PARSE = 'cv_parse',
  AI_SUGGEST = 'ai_suggest',
}

// Skill enums
export enum SkillCategory {
  PROFESSIONAL = 'professional',
  TECHNICAL = 'technical',
  INTERPERSONAL = 'interpersonal',
  DOMAIN = 'domain',
  LANGUAGE = 'language',
  TOOL = 'tool',
}

export enum SkillLevel {
  STRONG = 'strong',
  USED_BEFORE = 'used_before',
  LEARNING = 'learning',
}

// Experience enums
export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  FREELANCE = 'freelance',
  INTERNSHIP = 'internship',
}

export enum WorkScope {
  INDIVIDUAL = 'individual',
  TEAM = 'team',
  MULTI_TEAM = 'multi_team',
  ORGANIZATION = 'organization',
}

// Project enums
export enum ProjectContext {
  ACADEMIC = 'academic',
  PERSONAL = 'personal',
  FREELANCE = 'freelance',
  INTERNAL = 'internal',
  VOLUNTEER = 'volunteer',
}

// Career & Preferences enums
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

export enum WorkingHours {
  FIXED = 'fixed',
  FLEXIBLE = 'flexible',
  SHIFT = 'shift',
}

// CV Import enums
export enum ImportStatus {
  PARSED = 'parsed',
  CONFIRMED = 'confirmed',
  DISCARDED = 'discarded',
}

// JSONB interfaces for entity fields
export interface SkillContext {
  type: 'experience' | 'project' | 'education' | 'certification';
  referenceId: string | null;
}

export interface SkillEvidence {
  type: 'achievement' | 'metric' | 'interview_answer' | 'cv_bullet';
  description: string;
}

export interface Responsibility {
  description: string;
  impact: string | null;
  metrics: string[];
}

export interface SalaryRange {
  min: number | null;
  max: number | null;
  currency: string;
}

export interface AvoidPreferences {
  roles: string[];
  industries: string[];
  skills: string[];
}

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

export interface UsageStats {
  cvGenerated: number;
  jobMatched: number;
  mockInterview: number;
}
