const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const supabase = req.app.locals.supabase;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check email verification (skip in dev)
    if (process.env.NODE_ENV !== 'development' && !user.email_verified) {
      return res.status(403).json({ error: 'Please verify your email first' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, companyId: user.company_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, companyId: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    next(error);
  }
};
