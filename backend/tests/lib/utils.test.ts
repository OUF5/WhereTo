import { describe, it, expect } from 'vitest';
import { generateJoinCode, normalizeGroupName, normalizePlaceName } from '../../src/lib/utils.js';

describe('generateJoinCode', () => {
  it('should generate a 12-character code', () => {
    const code = generateJoinCode();
    expect(code).toHaveLength(12);
  });

  it('should only contain uppercase alphanumeric characters', () => {
    const code = generateJoinCode();
    expect(code).toMatch(/^[A-Z0-9]+$/);
  });

  it('should generate unique codes', () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateJoinCode());
    }
    expect(codes.size).toBe(100);
  });
});

describe('normalizeGroupName', () => {
  it('should lowercase and trim the name', () => {
    expect(normalizeGroupName('  Weekend Crew  ')).toBe('weekend crew');
  });

  it('should handle Arabic characters', () => {
    expect(normalizeGroupName('العيال')).toBe('العيال');
  });
});

describe('normalizePlaceName', () => {
  it('should lowercase and trim the name', () => {
    expect(normalizePlaceName('  Shawarmer Exit 6  ')).toBe('shawarmer exit 6');
  });
});

