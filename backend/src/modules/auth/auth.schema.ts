import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  city: z.string().min(2).max(100),
  mode: z.enum(['create_tenant', 'join_by_code']),
  groupName: z.string().min(2).max(100).optional(),
  joinCode: z.string().length(12).optional(),
}).refine(
  (data) => {
    if (data.mode === 'create_tenant') return !!data.groupName;
    if (data.mode === 'join_by_code') return !!data.joinCode;
    return false;
  },
  {
    message: 'groupName is required for create_tenant, joinCode is required for join_by_code',
  }
);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const refreshSchema = z.object({
  refreshToken: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;

