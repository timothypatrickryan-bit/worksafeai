const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    // Hash password (use trimmed password)
    const hashedPassword = await bcrypt.hash(trimmedPassword, 12);

    // Create company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: companyName,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
