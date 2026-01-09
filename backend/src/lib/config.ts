// Only load dotenv in development (Cloud Run injects env vars directly)
if (process.env.NODE_ENV !== 'production') {
  await import('dotenv/config');
}

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8080), // Cloud Run default is 8080
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
});

// Log environment for debugging (won't show secrets, just that they exist)
console.log('🔧 Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  DATABASE_URL: process.env.DATABASE_URL ? '✓ set' : '✗ missing',
  JWT_SECRET: process.env.JWT_SECRET ? '✓ set' : '✗ missing',
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export const config = parsed.data;

