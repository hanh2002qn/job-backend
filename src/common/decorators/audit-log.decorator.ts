import { SetMetadata } from '@nestjs/common';

export enum AuditModule {
  USERS = 'USERS',
  JOBS = 'JOBS',
  AI_CONFIG = 'AI_CONFIG',
  PROMPT = 'PROMPT',
  SETTINGS = 'SETTINGS',
  DASHBOARD = 'DASHBOARD',
  SUPPORT = 'SUPPORT',
}

export enum AuditActionType {
  // Users
  BAN_USER = 'BAN_USER',
  DELETE_USER = 'DELETE_USER',
  CHANGE_USER_ROLE = 'CHANGE_USER_ROLE',
  VERIFY_USER = 'VERIFY_USER',
  // Jobs
  MODERATE_JOB = 'MODERATE_JOB',
  DELETE_JOB = 'DELETE_JOB',
  // AI
  UPDATE_AI_FEATURE = 'UPDATE_AI_FEATURE',
  TOGGLE_AI_FEATURE = 'TOGGLE_AI_FEATURE',
  // Prompts
  CREATE_PROMPT = 'CREATE_PROMPT',
  UPDATE_PROMPT = 'UPDATE_PROMPT',
  DELETE_PROMPT = 'DELETE_PROMPT',
  // Settings
  UPDATE_SETTING = 'UPDATE_SETTING',
  // Dashboard
  TOGGLE_MAINTENANCE = 'TOGGLE_MAINTENANCE',
  // Support
  IMPERSONATE_USER = 'IMPERSONATE_USER',
}

export interface AuditActionOptions {
  action: AuditActionType;
  module: AuditModule;
}

export const AUDIT_ACTION_KEY = 'audit_action';
export const AuditAction = (options: AuditActionOptions) => SetMetadata(AUDIT_ACTION_KEY, options);
