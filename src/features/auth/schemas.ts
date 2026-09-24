import { z } from 'zod';

export const phoneSchema = z
  .string()
  .min(10, 'Please enter a valid 10-digit phone number')
  .regex(/^[0-9+ ]{10,16}$/, 'Invalid phone number format');

export const emailSchema = z
  .string()
  .email('Please enter a valid email address');

export const otpSchema = z
  .string()
  .length(6, 'Verification code must be exactly 6 digits')
  .regex(/^[0-9]{6}$/, 'Verification code must contain only numbers');

export const createAccountSchema = z.object({
  method: z.enum(['phone', 'email']),
  identifier: z.string().min(1, 'Please enter your phone number or email'),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms and Privacy Policy to continue' }),
  }),
  marketingConsent: z.boolean().default(false),
  referralCode: z.string().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Please enter your registered phone number or email'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const recoverySchema = z.object({
  identifier: z.string().min(1, 'Please enter your phone number or email'),
});

export type RecoveryInput = z.infer<typeof recoverySchema>;
