/**
 * Input validation schemas using Zod
 */

import { z } from 'zod';

// Auth schemas
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain uppercase letter').regex(/[a-z]/, 'Password must contain lowercase letter').regex(/[0-9]/, 'Password must contain a number'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
});

// Task schemas
export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title required').max(255, 'Title too long'),
  description: z.string().optional().default(''),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  project: z.string().min(1, 'Project required').max(100, 'Project name too long'),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1, 'Title required').max(255, 'Title too long').optional(),
  description: z.string().max(5000, 'Description too long').optional(),
  status: z.enum(['pending', 'executing', 'completed', 'failed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  project: z.string().min(1, 'Project required').max(100, 'Project name too long').optional(),
  started_at: z.string().datetime().optional().nullable(),
  completed_at: z.string().datetime().optional().nullable(),
  output: z.string().optional().nullable(),
});

// Type exports for use in handlers
export type RegisterPayload = z.infer<typeof RegisterSchema>;
export type LoginPayload = z.infer<typeof LoginSchema>;
export type RefreshTokenPayload = z.infer<typeof RefreshTokenSchema>;
export type CreateTaskPayload = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskPayload = z.infer<typeof UpdateTaskSchema>;

// Validation helper
export function validateRequest<T>(schema: z.ZodSchema, data: unknown): { success: boolean; data?: T; error?: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
    };
  }
  return { success: true, data: result.data as T };
}
