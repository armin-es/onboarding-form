import { z } from 'zod';
import { queryClient } from '../../lib/react-query';
import { validateCorporationNumber } from './api';
import { isValidPhoneFormat, isCanadianPhoneNumber } from '../../utils/validators';

// Base field definitions (reusable)
const firstNameField = z
  .string()
  .min(1, 'First name is required')
  .max(50, 'First name cannot exceed 50 characters');

const lastNameField = z
  .string()
  .min(1, 'Last name is required')
  .max(50, 'Last name cannot exceed 50 characters');

const phoneField = z
  .string()
  .min(1, 'Phone number is required')
  .refine(isValidPhoneFormat, {
    message: 'Phone number must start with +1 and contain exactly 10 digits',
  })
  .refine(isCanadianPhoneNumber, {
    message: 'Phone number must be a valid Canadian number',
  });

const corporationNumberFieldBase = z
  .string()
  .min(1, 'Corporation number is required')
  .length(9, 'Corporation number must be exactly 9 characters');

// API request schema (synchronous validation only)
export const profileDetailsSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
  phone: phoneField,
  corporationNumber: corporationNumberFieldBase,
});

// Form schema (extends API schema with async validation for corporation number)
export const onboardingFormSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
  phone: phoneField,
  corporationNumber: corporationNumberFieldBase.refine(
    async (value) => {
      // Only validate if it's 9 digits to avoid unnecessary API calls on partial input
      if (value.length !== 9) return false;
      
      try {
        const data = await queryClient.fetchQuery({
          queryKey: ['corporation', value],
          queryFn: () => validateCorporationNumber(value),
          staleTime: 1000 * 60 * 30, // Cache for 30 mins (corporation numbers rarely change)
          gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour after last use
        });
        return data.valid;
      } catch (error) {
        console.error("Validation error", error);
        return false;
      }
    },
    { message: 'Invalid corporation number' }
  ),
});

// Type export - single source of truth for profile data structure
export type ProfileDetails = z.infer<typeof profileDetailsSchema>;
