const { z } = require('zod');

// Strong password requirements (12+ chars, uppercase, lowercase, number, special)
const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character');

// Email verification request
const requestEmailVerificationSchema = z.object({
  email: z.string().email('Invalid email'),
});

// Verify email token
const verifyEmailSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  token: z.string().min(20, 'Invalid verification token'),
});

// Forgot password request
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

// Reset password with token (uses strong password requirements)
const resetPasswordSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  token: z.string().min(20, 'Invalid reset token'),
  newPassword: passwordSchema,
});

// Change password (authenticated user, uses strong password requirements)
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: passwordSchema,
});

module.exports = {
  requestEmailVerificationSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
