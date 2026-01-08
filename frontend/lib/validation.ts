import { z } from 'zod';

// Auth schemas (mirroring backend)
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name too long'),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password too long'),
    city: z
      .string()
      .min(2, 'City must be at least 2 characters')
      .max(100, 'City name too long'),
    mode: z.enum(['create_tenant', 'join_by_code']),
    groupName: z
      .string()
      .min(2, 'Group name must be at least 2 characters')
      .max(100, 'Group name too long')
      .optional(),
    joinCode: z.string().length(12, 'Join code must be 12 characters').optional(),
  })
  .refine(
    (data) => {
      if (data.mode === 'create_tenant') return !!data.groupName;
      if (data.mode === 'join_by_code') return !!data.joinCode;
      return false;
    },
    {
      message: 'Group name or join code is required',
      path: ['groupName'],
    }
  );

// Place schemas
export const createPlaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name too long'),
  category: z.enum(['EATING', 'CHILLING', 'EVENT_JOY'], {
    required_error: 'Select a category',
  }),
  description: z.string().max(500, 'Description too long').optional(),
});

// Spin schemas
export const createSpinSchema = z.object({
  type: z.literal('GROUP_SUGGESTED'),
  category: z.enum(['EATING', 'CHILLING', 'EVENT_JOY'], {
    required_error: 'Select a category',
  }),
  excludedItemKeys: z.array(z.string()).default([]),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;
export type CreateSpinInput = z.infer<typeof createSpinSchema>;

// Category display names
export const CATEGORY_LABELS: Record<string, string> = {
  EATING: '🍔 EATING',
  CHILLING: '☕ CHILLING',
  EVENT_JOY: '🎉 EVENT JOY',
};

export const CATEGORY_OPTIONS = [
  { value: 'EATING', label: '🍔 EATING' },
  { value: 'CHILLING', label: '☕ CHILLING' },
  { value: 'EVENT_JOY', label: '🎉 EVENT JOY' },
];

