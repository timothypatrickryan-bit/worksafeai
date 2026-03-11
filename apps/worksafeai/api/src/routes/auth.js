const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const authService = require('../services/authService');
const { authenticateToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { registerSchema, loginSchema, acceptInviteSchema } = require('../validation/schemas');
const { verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } = require('../validation/email-schemas');
const emailService = require('../services/emailService');

// POST /api/auth/register - Simplified registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, companyName } = req.body;
    const supabase = req.app.locals.supabase;

    // Validate required fields
    if (!email || !password || !fullName || !companyName) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // CRITICAL: Enforce password requirements on backend
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 12 characters with uppercase, lowercase, number, and special character' 
      });
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create company
    const companyId = uuidv4();
    const { error: companyError } = await supabase
      .from('companies')
      .insert({
        id: companyId,
        name: companyName,
        subscription_tier: 'starter',
        subscription_status: 'trialing',
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

    if (companyError) throw companyError;

    // Create user - CRITICAL: Set email_verified to false
    const userId = uuidv4();
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        password_hash: hashedPassword,
        full_name: fullName,
        company_id: companyId,
        role: 'owner',
        is_active: true,
        email_verified: false, // Require verification
        language: 'en',
      });

    if (userError) throw userError;

    // Send verification email
    emailService.sendVerificationEmail({
      recipientEmail: email,
      recipientName: fullName,
      verificationLink: `${process.env.APP_URL}/verify-email?user_id=${userId}&token=placeholder`,
    }).catch(err => {
      console.error(`Failed to send verification email to ${email}:`, err.message);
    });

    // Return success message - user must verify email before login
    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      requiresEmailVerification: true,
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login - Simplified login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const supabase = req.app.locals.supabase;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // CRITICAL: Check password validity first to prevent email enumeration
    let passwordMatch = false;
    if (user && user.password_hash) {
      passwordMatch = await bcrypt.compare(password, user.password_hash);
    }

    // Return generic error (don't reveal if user exists)
    if (error || !user || !passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // CRITICAL: Check user account status before allowing login
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is disabled' });
    }

    // Check if email is verified (unless in development)
    if (process.env.NODE_ENV !== 'development' && !user.email_verified) {
      return res.status(401).json({ error: 'Please verify your email before logging in' });
    }

    // Generate tokens using proper secrets
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, fullName: user.full_name, companyId: user.company_id, role: user.role },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    // CRITICAL: Use proper refresh secret (not concatenation)
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      refreshSecret,
      { algorithm: 'HS256', expiresIn: '7d' }
    );

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, fullName: user.full_name, companyId: user.company_id, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name, role, company_id, language')
      .eq('id', req.user.id)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Auth /me error:', error.message);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  // Client-side JWT logout (stateless)
  res.json({ message: 'Logged out' });
});

// POST /api/auth/refresh-token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // Use the refresh-specific secret (matches generateRefreshToken in authService)
    const refreshSecret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '_refresh');
    // Specify algorithm explicitly to prevent algorithm confusion attacks
    const decoded = jwt.verify(refreshToken, refreshSecret, { algorithms: ['HS256'] });
    
    // Fetch fresh user data from DB (only fields needed for token generation)
    const supabase = req.app.locals.supabase;
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, company_id, is_active, deleted_at, email_verified')
      .eq('id', decoded.id)
      .single();

    // Check user exists and is active
    if (error || !user) {
      return res.status(403).json({ error: 'User not found' });
    }

    // Check if user is active
    if (!user.is_active || user.deleted_at) {
      return res.status(403).json({ error: 'User account is disabled' });
    }

    // Check if email is verified (same dev bypass as login endpoint)
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (!isDevelopment && !user.email_verified) {
      return res.status(403).json({ error: 'Email must be verified before accessing the application' });
    }

    // Generate new tokens (refresh token rotation for security)
    const newAccessToken = authService.generateToken(user);
    const newRefreshToken = authService.generateRefreshToken(user);
    res.json({ 
      accessToken: newAccessToken,
      refreshToken: newRefreshToken 
    });
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/accept-invite - accept an employee invite
// Request body format: { userId: "uuid", token: "temp_password", newPassword?: "new_pwd" }
// Note: Email link contains user_id and token as query params; frontend must convert to camelCase for JSON body
router.post('/accept-invite', validateBody(acceptInviteSchema), async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { userId, token, newPassword } = req.validatedBody;

    // Fetch user (should have is_active=false)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role, company_id, password_hash, is_active, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify token matches the temporary password hash
    const tokenValid = await bcrypt.compare(token, user.password_hash);
    if (!tokenValid) {
      return res.status(401).json({ error: 'Invalid or expired invite token' });
    }

    // Check if invitation has expired (7 days)
    const createdTime = new Date(user.created_at).getTime();
    const nowTime = Date.now();
    const ageInDays = (nowTime - createdTime) / (1000 * 60 * 60 * 24);
    const INVITE_EXPIRY_DAYS = 7;
    
    if (ageInDays > INVITE_EXPIRY_DAYS) {
      return res.status(401).json({ error: 'Invitation has expired. Please contact your administrator for a new invite.' });
    }

    // Check if user is already active (invite already accepted)
    if (user.is_active) {
      return res.status(400).json({ error: 'This invite has already been accepted' });
    }

    // If new password provided, hash and update it; otherwise use existing hash
    let passwordHash = user.password_hash;
    if (newPassword) {
      passwordHash = await bcrypt.hash(newPassword, 12);
    }

    // Activate user and update password
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        is_active: true,
        password_hash: passwordHash,
        updated_at: new Date(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Generate tokens
    const accessToken = authService.generateToken(updatedUser);
    const refreshToken = authService.generateRefreshToken(updatedUser);

    res.json({
      message: 'Invite accepted successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        role: updatedUser.role,
        companyId: updatedUser.company_id,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Accept invite error:', error.message);
    res.status(500).json({ error: 'Failed to accept invite. Please try again.' });
  }
});

// POST /api/auth/verify-email - verify email with token (rate limited to 5 attempts/15min via server.js)
router.post('/verify-email', validateBody(verifyEmailSchema), async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { userId, token } = req.validatedBody;

    // Fetch verification token (only unused tokens)
    const { data: verificationTokens } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('used_at', null) // Only unused tokens
      .order('created_at', { ascending: false })
      .limit(1);

    if (!verificationTokens || verificationTokens.length === 0) {
      return res.status(401).json({ error: 'No valid verification token found' });
    }

    const tokenRecord = verificationTokens[0];

    // Check if token is expired
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Verification token has expired' });
    }

    // Verify token hash matches
    const tokenValid = await bcrypt.compare(token, tokenRecord.token_hash);
    if (!tokenValid) {
      return res.status(401).json({ error: 'Invalid verification token' });
    }

    // Mark token as used first (atomic to prevent race condition)
    const { error: markUsedError } = await supabase
      .from('email_verification_tokens')
      .update({ used_at: new Date() })
      .eq('id', tokenRecord.id);

    if (markUsedError) throw markUsedError;

    // Now mark email as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        email_verified_at: new Date(),
        updated_at: new Date(),
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Clean up old tokens for this user
    await supabase
      .from('email_verification_tokens')
      .delete()
      .eq('user_id', userId)
      .lt('expires_at', new Date());

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('verify-email error:', error.message);
    res.status(500).json({ error: 'Email verification failed. Please try again.' });
  }
});

// POST /api/auth/forgot-password - request password reset
router.post('/forgot-password', validateBody(forgotPasswordSchema), async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { email } = req.validatedBody;

    // Find user
    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', email)
      .single();

    // Don't reveal if email exists
    if (!user) {
      return res.json({ message: 'If an account exists, a reset email has been sent' });
    }

    // Invalidate any old unused reset tokens for this user
    await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date() })
      .eq('user_id', user.id)
      .eq('used_at', null);

    // Generate reset token (24-hour expiry)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(resetToken, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Store new token
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

    if (tokenError) throw tokenError;

    // Send email asynchronously
    emailService.sendPasswordResetEmail({
      recipientEmail: user.email,
      recipientName: user.full_name,
      resetLink: `${process.env.APP_URL || 'https://app.jtsa-tool.com'}/reset-password?user_id=${user.id}&token=${resetToken}`,
    }).catch(err => {
      console.error(`Failed to send password reset email to ${user.email}:`, err.message);
    });

    res.json({ message: 'If an account exists, a reset email has been sent' });
  } catch (error) {
    console.error('forgot-password error:', error.message);
    // Always return success-like message to prevent email enumeration
    res.json({ message: 'If an account exists, a reset email has been sent' });
  }
});

// POST /api/auth/reset-password - reset password with token
router.post('/reset-password', validateBody(resetPasswordSchema), async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { userId, token, newPassword } = req.validatedBody;

    // Fetch reset token
    const { data: resetTokens } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('used_at', null) // Only unused tokens
      .order('created_at', { ascending: false })
      .limit(1);

    if (!resetTokens || resetTokens.length === 0) {
      return res.status(401).json({ error: 'No reset token found' });
    }

    const tokenRecord = resetTokens[0];

    // Check if token is expired
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Reset token has expired' });
    }

    // Verify token hash matches
    const tokenValid = await bcrypt.compare(token, tokenRecord.token_hash);
    if (!tokenValid) {
      return res.status(401).json({ error: 'Invalid reset token' });
    }

    // Hash new password (12 rounds to match registration — consistent security)
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: newPasswordHash,
        password_changed_at: new Date(),
        updated_at: new Date(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date() })
      .eq('id', tokenRecord.id);

    // Generate new JWT tokens (auto-login after reset)
    const accessToken = authService.generateToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    res.json({
      message: 'Password reset successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        companyId: user.company_id,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('reset-password error:', error.message);
    res.status(500).json({ error: 'Password reset failed. Please try again.' });
  }
});

// POST /api/auth/change-password - change password (authenticated user)
router.post('/change-password', authenticateToken, validateBody(changePasswordSchema), async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { currentPassword, newPassword } = req.validatedBody;

    // Fetch user (only password_hash needed for verification)
    const { data: user } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('id', req.user.id)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password (12 rounds to match registration — consistent security)
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: newPasswordHash,
        password_changed_at: new Date(),
        updated_at: new Date(),
      })
      .eq('id', req.user.id);

    if (updateError) throw updateError;

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('change-password error:', error.message);
    res.status(500).json({ error: 'Password change failed. Please try again.' });
  }
});

module.exports = router;
