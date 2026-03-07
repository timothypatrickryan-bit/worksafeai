const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { verifyCompanyAccess } = require('../middleware/companyAccess');
const { validateBody } = require('../middleware/validation');
const { inviteEmployeeSchema } = require('../validation/schemas');

// GET /api/companies/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    // Verify user belongs to company
    if (req.user.companyId !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/companies/:id
router.patch('/:id', authenticateToken, authorizeRole(['owner', 'admin']), verifyCompanyAccess, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { name } = req.body;

    const { data: company } = await supabase
      .from('companies')
      .update({ name, updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();

    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/companies/:id/users (invite employee)
router.post('/:id/users', authenticateToken, authorizeRole(['owner', 'admin']), verifyCompanyAccess, validateBody(inviteEmployeeSchema), async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { email, fullName, role } = req.validatedBody;
    const companyId = req.params.id;
    const emailService = require('../services/emailService');

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
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

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
    const inviterName = req.user.full_name || req.user.email;
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
    res.status(500).json({ error: error.message });
  }
});

// GET /api/companies/:id/users
router.get('/:id/users', authenticateToken, authorizeRole(['owner', 'admin']), verifyCompanyAccess, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    const { data: users } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at')
      .eq('company_id', req.params.id);

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
