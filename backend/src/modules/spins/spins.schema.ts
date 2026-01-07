import { z } from 'zod';

export const createSpinSchema = z.object({
  type: z.literal('GROUP_SUGGESTED'), // Stage 1: only GROUP_SUGGESTED
  category: z.enum(['EATING', 'CHILLING', 'EVENT_JOY']),
  excludedItemKeys: z.array(z.string()).default([]),
});

export type CreateSpinInput = z.infer<typeof createSpinSchema>;

