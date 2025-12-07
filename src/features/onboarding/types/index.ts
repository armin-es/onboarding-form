import { z } from 'zod';

// API Response Schemas
export const CorporationValidationResponseSchema = z.object({
  valid: z.boolean(),
  corporationNumber: z.string().optional(),
  message: z.string().optional(),
});

export type CorporationValidationResponse = z.infer<typeof CorporationValidationResponseSchema>;

// Re-export ProfileDetails from schema.ts (single source of truth)
export type { ProfileDetails } from '../schema';

export interface ApiError {
  message: string;
}
