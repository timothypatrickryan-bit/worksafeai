const { z } = require('zod');

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

// Reset password with token
const resetPasswordSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  token: z.string().min(20, 'Invalid reset token'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// Change password (authenticated user)
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

module.exports = {
  requestEmailVerificationSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
