import { SetMetadata } from '@nestjs/common';

export interface AuditActionOptions {
  action: string;
  module: string;
}

export const AUDIT_ACTION_KEY = 'audit_action';
export const AuditAction = (options: AuditActionOptions) => SetMetadata(AUDIT_ACTION_KEY, options);
