import { randomBytes } from 'crypto';

// Generate a random 12-character alphanumeric join code
export function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = randomBytes(12);
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

// Normalize group name for case-insensitive comparison
export function normalizeGroupName(name: string): string {
  return name.trim().toLowerCase();
}

// Normalize place name for uniqueness check
export function normalizePlaceName(name: string): string {
  return name.trim().toLowerCase();
}

