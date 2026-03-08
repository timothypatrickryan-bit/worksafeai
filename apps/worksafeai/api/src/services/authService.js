const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, companyId: user.company_id, fullName: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: parseInt(process.env.JWT_EXPIRY) || 3600 }
  );
};

const generateRefreshToken = (user) => {
  // Use a separate secret for refresh tokens so they cannot be substituted
  // for access tokens even if the payload is otherwise accepted.
  // Falls back to JWT_SECRET + '_refresh' when JWT_REFRESH_SECRET is not set,
  // which is still distinct from the access-token secret.
  const refreshSecret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '_refresh');
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    refreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || 604800 }
  );
};

const register = async (supabase, data) => {
  // Data is already validated by middleware (including industry validation)
  const validated = data;

  // Check if email exists (case-insensitive)
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .ilike('email', validated.email)
    .single();

  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Use provided industry or default to 'Other' (will be updated during onboarding)
  const industry = validated.industry || 'Other';
  
  // Validate industry is in allowed list
  const allowedIndustries = [
    'General Contracting', 'Electrical', 'Plumbing & HVAC', 'Excavation & Demolition',
    'Heavy Equipment Operation', 'Utility Services', 'Concrete & Masonry', 'Roofing',
    'Landscaping', 'Interior Finish', 'Demolition', 'Heavy Lifting', 'Other'
  ];
  
  if (!allowedIndustries.includes(industry)) {
    throw new Error('Invalid industry selected');
  }

  // Create company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      name: validated.companyName,
      industry: industry,
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
    industry: company.industry,
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

  // In development, skip email verification requirement for testing
  // In production, email verification is mandatory
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!isDevelopment && !user.email_verified) {
    throw new Error('Please verify your email before logging in');
  }

  // Fetch company to get industry
  const { data: company } = await supabase
    .from('companies')
    .select('industry')
    .eq('id', user.company_id)
    .single();

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
    industry: company?.industry,
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
