const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendCompanyRegistrationAttemptEmail } = require('../../services/emailService');

module.exports = async (req, res, next) => {
  try {
    const { fullName, companyName, email, password } = req.body;
    const supabase = req.app.locals.supabase;

    // Validation
    if (!fullName || !companyName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Sanitize inputs
    const trimmedPassword = password.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedPassword.length < 12) {
      return res.status(400).json({ error: 'Password must be at least 12 characters' });
    }

    // Better special character validation (CRITICAL FIX)
    const specialCharRegex = /[!@#$%^&*()_+=\-\[\]{};':"\\|,.<>\/?]/;
    const hasUppercase = /[A-Z]/.test(trimmedPassword);
    const hasLowercase = /[a-z]/.test(trimmedPassword);
    const hasNumber = /[0-9]/.test(trimmedPassword);
    const hasSpecialChar = specialCharRegex.test(trimmedPassword);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({ 
        error: 'Password must contain uppercase, lowercase, number, and special character' 
      });
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', trimmedEmail)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Check if company already exists (case-insensitive)
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id, name')
      .ilike('name', companyName)
      .single();

    if (existingCompany) {
      // Company exists — get owner info and send notification
      const { data: owner } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('company_id', existingCompany.id)
        .eq('role', 'owner')
        .single();

      if (owner) {
        try {
          await sendCompanyRegistrationAttemptEmail({
            adminEmail: owner.email,
            adminName: owner.full_name || 'Admin',
            newUserName: fullName,
            newUserEmail: trimmedEmail,
            companyName: companyName,
          });
          console.log(`Admin notification sent to ${owner.email} for ${companyName}`);
        } catch (emailError) {
          console.error('Failed to send admin notification:', emailError);
          // Don't fail registration if email fails — just log it
        }
      }

      return res.status(409).json({
        error: 'Company already exists',
        message: `The company "${companyName}" is already registered. We've notified the company admin about your registration request. They may invite you to join their team.`,
      });
    }

    // Hash password (use trimmed password)
    const hashedPassword = await bcrypt.hash(trimmedPassword, 12);

    // Create company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: companyName,
        subscription_tier: 'starter',
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        billing_active: false,
      })
      .select('id')
      .single();

    if (companyError) {
      console.error('❌ Company creation error:', companyError);
      return res.status(500).json({ error: 'Failed to create company' });
    }

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        company_id: company.id,
        email: trimmedEmail,
        full_name: fullName,
        password_hash: hashedPassword,
        role: 'owner',
        email_verified: process.env.NODE_ENV === 'development', // Auto-verify in dev
      })
      .select('id, email, full_name, role')
      .single();

    if (userError) {
      console.error('❌ User creation error:', userError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, companyId: company.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, companyId: company.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user,
      company: { id: company.id, name: companyName },
      accessToken,
      refreshToken,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    next(error);
  }
};
