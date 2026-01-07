import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../../../src/modules/auth/auth.schema.js';

describe('registerSchema', () => {
  it('should validate create_tenant mode with groupName', () => {
    const result = registerSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      city: 'Riyadh',
      mode: 'create_tenant',
      groupName: 'Weekend Crew',
    });
    expect(result.success).toBe(true);
  });

  it('should validate join_by_code mode with joinCode', () => {
    const result = registerSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      city: 'Riyadh',
      mode: 'join_by_code',
      joinCode: 'ABC123DEF456',
    });
    expect(result.success).toBe(true);
  });

  it('should fail create_tenant without groupName', () => {
    const result = registerSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      city: 'Riyadh',
      mode: 'create_tenant',
    });
    expect(result.success).toBe(false);
  });

  it('should fail join_by_code without joinCode', () => {
    const result = registerSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      city: 'Riyadh',
      mode: 'join_by_code',
    });
    expect(result.success).toBe(false);
  });

  it('should fail with invalid email', () => {
    const result = registerSchema.safeParse({
      fullName: 'John Doe',
      email: 'invalid-email',
      password: 'password123',
      city: 'Riyadh',
      mode: 'create_tenant',
      groupName: 'Weekend Crew',
    });
    expect(result.success).toBe(false);
  });

  it('should fail with short password', () => {
    const result = registerSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: '123',
      city: 'Riyadh',
      mode: 'create_tenant',
      groupName: 'Weekend Crew',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('should validate valid login input', () => {
    const result = loginSchema.safeParse({
      email: 'john@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('should fail with invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });
});

