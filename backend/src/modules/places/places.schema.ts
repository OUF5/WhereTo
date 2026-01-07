import { z } from 'zod';

export const createPlaceSchema = z.object({
  name: z.string().min(2).max(200),
  category: z.enum(['EATING', 'CHILLING', 'EVENT_JOY']),
  description: z.string().max(500).optional(),
});

export const listPlacesQuerySchema = z.object({
  category: z.enum(['EATING', 'CHILLING', 'EVENT_JOY']).optional(),
  isActive: z.coerce.boolean().optional(),
  q: z.string().optional(),
});

export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;
export type ListPlacesQuery = z.infer<typeof listPlacesQuerySchema>;

