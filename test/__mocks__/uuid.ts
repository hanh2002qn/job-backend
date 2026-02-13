// Manual mock for uuid v13 (ESM-only) — provides CJS-compatible mock
export const v4 = (): string => 'mock-uuid-v4';
export const v1 = (): string => 'mock-uuid-v1';
export const validate = (_str: string): boolean => true;
export const NIL = '00000000-0000-0000-0000-000000000000';
export const MAX = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
