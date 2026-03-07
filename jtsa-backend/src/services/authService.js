const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, companyId: user.company_id, fullName: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || 3600 }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || 604800 }
  );
};

const register = async (supabase, data) => {
  // Data is already validated by middleware
  const validated = data;

  // Check if email exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', validated.email)
    .single();

  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Create company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      name: validated.companyName,
      subscription_tier: 'starter',
      trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      billing_active: false,
    })
    .select()
    .single();

  if (companyError) throw companyError;

  // Hash password
  const hashedPassword = await bcrypt.hash(validated.password, 10);

  // Create user (owner) - email_verified defaults to false
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      email: validated.email,
      password_hash: hashedPassword,
      full_name: validated.fullName,
      role: 'owner',
      company_id: company.id,
      language: 'en',
      email_verified: false, // Must verify email before login
    })
    .select()
    .single();

  if (userError) throw userError;

  // Create subscription record
  await supabase
    .from('subscriptions')
    .insert({
      company_id: company.id,
      tier: 'starter',
      status: 'active',
      trial_ends_at: company.trial_ends_at,
    });

  // Generate tokens
  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      companyId: user.company_id,
    },
    accessToken,
    refreshToken,
  };
};

const login = async (supabase, data) => {
  // Data is already validated by middleware
  const validated = data;

  // Find user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', validated.email)
    .single();

  if (error || !user) {
    throw new Error('Invalid email or password');
  }

  // Check password
  const passwordMatch = await bcrypt.compare(validated.password, user.password_hash);
  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  // Check if user account is active
  if (!user.is_active || user.deleted_at) {
    throw new Error('User account is disabled or has been deleted');
  }

  // Check if email is verified (unless user was invited - they skip verification)
  if (!user.email_verified) {
    throw new Error('Please verify your email before logging in');
  }

  // Generate tokens
  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      companyId: user.company_id,
    },
    accessToken,
    refreshToken,
  };
};

module.exports = {
  register,
  login,
  generateToken,
  generateRefreshToken,
};
