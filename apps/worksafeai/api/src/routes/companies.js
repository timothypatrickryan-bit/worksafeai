const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { verifyCompanyAccess } = require('../middleware/companyAccess');
const { validateBody } = require('../middleware/validation');
const { inviteEmployeeSchema, updateCompanySchema } = require('../validation/schemas');

// Safe fields to return for a company (excludes Stripe secrets, internal flags)
const COMPANY_SAFE_FIELDS = 'id, name, industry, subscription_tier, subscription_status, billing_period_end, billing_active, trial_ends_at, onboarding_completed, created_at, updated_at';

// GET /api/companies/:id
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const supabase = req.app.locals.supabase;
    
    // Validate UUID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.params.id)) {
      return res.status(400).json({ error: 'Invalid company ID format' });
    }

    // Verify user belongs to company
    if (req.user.companyId !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: company } = await supabase
      .from('companies')
      .select(COMPANY_SAFE_FIELDS)
      .eq('id', req.params.id)
      .single();

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/companies/:id
router.patch('/:id', authenticateToken, authorizeRole(['owner', 'admin']), verifyCompanyAccess, validateBody(updateCompanySchema), async (req, res, next) => {
  try {
    const supabase = req.app.locals.supabase;
    const { name } = req.validatedBody;
    
    // Validate UUID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.params.id)) {
      return res.status(400).json({ error: 'Invalid company ID format' });
    }

    const { data: company } = await supabase
      .from('companies')
      .update({ name, updated_at: new Date() })
      .eq('id', req.params.id)
      .select(COMPANY_SAFE_FIELDS)
      .single();

    res.json(company);
  } catch (error) {
    next(error);
  }
});

// POST /api/companies/:id/users (invite employee)
router.post('/:id/users', authenticateToken, authorizeRole(['owner', 'admin']), verifyCompanyAccess, validateBody(inviteEmployeeSchema), async (req, res, next) => {
  try {
    const supabase = req.app.locals.supabase;
    const { email, fullName, role } = req.validatedBody;
    const companyId = req.params.id;
    const emailService = require('../services/emailService');
    
    // Validate UUID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(companyId)) {
      return res.status(400).json({ error: 'Invalid company ID format' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create user with is_active = false (pending invite acceptance)
    const crypto = require('crypto');
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        full_name: fullName,
        role,
        company_id: companyId,
        is_active: false, // Pending acceptance
        language: 'en',
      })
      .select()
      .single();

    if (createError) throw createError;

    // Send invite email
    // JWT payload uses camelCase; full_name is the DB column name, not the token field
    const inviterName = req.user.fullName || req.user.email;
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single();

    try {
      await emailService.sendInviteEmail({
        recipientEmail: email,
        recipientName: fullName,
        companyName: company?.name || 'your company',
        inviterName,
        role,
        // Note: Email link has user_id and token query params
        // Frontend should POST to /api/auth/accept-invite with { userId, token } in JSON body
        inviteLink: `${process.env.APP_URL || 'https://app.jtsa-tool.com'}/accept-invite?user_id=${newUser.id}&token=${tempPassword}`,
      });

      res.status(201).json({ 
        message: 'Invite sent successfully',
        user_id: newUser.id,
        email: newUser.email,
      });
    } catch (emailError) {
      console.error(`Failed to send invite email to ${email}:`, emailError.message);
      
      // If email fails, delete the created user and return error
      try {
        await supabase.from('users').delete().eq('id', newUser.id);
      } catch (deleteError) {
        console.error(`Failed to rollback user creation for ${email}:`, deleteError.message);
        // Log the orphaned user for manual cleanup
      }
      
      return res.status(500).json({ 
        error: 'Failed to send invite email. Please try again later.' 
      });
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/companies/:id/users/:userId - soft-delete employee
router.delete('/:id/users/:userId', authenticateToken, authorizeRole(['owner', 'admin']), verifyCompanyAccess, async (req, res, next) => {
  try {
    const supabase = req.app.locals.supabase;
    const companyId = req.params.id;
    const targetUserId = req.params.userId;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(targetUserId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Prevent self-deletion
    if (targetUserId === req.user.id) {
      return res.status(400).json({ error: 'Cannot remove yourself' });
    }

    // Verify target user belongs to this company
    const { data: targetUser, error: fetchError } = await supabase
      .from('users')
      .select('id, role, company_id')
      .eq('id', targetUserId)
      .eq('company_id', companyId)
      .single();

    if (fetchError || !targetUser) {
      return res.status(404).json({ error: 'User not found in this company' });
    }

    // Prevent removing the owner
    if (targetUser.role === 'owner') {
      return res.status(403).json({ error: 'Cannot remove the company owner' });
    }

    // Soft delete the user
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_active: false,
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .eq('id', targetUserId);

    if (updateError) throw updateError;

    // Audit log
    const auditService = require('../services/auditService');
    await auditService.logAction(supabase, {
      companyId,
      userId: req.user.id,
      action: 'user_removed',
      resourceType: 'user',
      resourceId: targetUserId,
    });

    res.json({ message: 'User removed successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/companies/:id/users
router.get('/:id/users', authenticateToken, authorizeRole(['owner', 'admin']), verifyCompanyAccess, async (req, res, next) => {
  try {
    const supabase = req.app.locals.supabase;
    
    // Validate UUID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.params.id)) {
      return res.status(400).json({ error: 'Invalid company ID format' });
    }

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_active, email_verified, created_at')
      .eq('company_id', req.params.id)
      .is('deleted_at', null);

    if (usersError) throw usersError;

    res.json(users || []);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
