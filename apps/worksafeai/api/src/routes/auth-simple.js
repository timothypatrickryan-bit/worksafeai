const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// POST /api/auth/register - Simple registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, companyName } = req.body;
    const supabase = req.app.locals.supabase;

    // Basic validation
    if (!email || !password || !fullName || !companyName) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (password.length < 12) {
      return res.status(400).json({ error: 'Password must be at least 12 characters' });
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
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
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

    if (companyError) throw companyError;

    // Create user
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
        email_verified: true, // Auto-verify for simple flow
        language: 'en',
      });

    if (userError) throw userError;

    // Generate JWT tokens
    const accessToken = jwt.sign(
      {
        id: userId,
        email,
        fullName,
        companyId,
        role: 'owner',
      },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET + '_refresh',
      { algorithm: 'HS256', expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email,
        fullName,
        companyId,
        role: 'owner',
      },
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
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

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        companyId: user.company_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET + '_refresh',
      { algorithm: 'HS256', expiresIn: '7d' }
    );

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        companyId: user.company_id,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
