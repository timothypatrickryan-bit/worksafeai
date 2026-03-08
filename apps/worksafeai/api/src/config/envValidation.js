/**
 * Environment Variable Validation
 * Ensures all required env vars are set and valid before app starts
 */

const required = (varName) => ({
  name: varName,
  required: true,
  validate: (value) => value !== undefined && value !== '',
  error: `Missing required environment variable: ${varName}`,
});

const optional = (varName, defaultValue = '') => ({
  name: varName,
  required: false,
  default: defaultValue,
});

const url = (varName) => ({
  name: varName,
  required: true,
  validate: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  error: `Invalid URL format for ${varName}`,
});

const port = (varName = 'PORT') => ({
  name: varName,
  required: false,
  default: '3000',
  validate: (value) => {
    const p = parseInt(value);
    return p > 0 && p < 65535;
  },
  error: `Invalid port number for ${varName}`,
});

const envConfig = [
  // Core
  required('NODE_ENV'),
  port('PORT'),

  // Supabase
  url('SUPABASE_URL'),
  required('SUPABASE_SERVICE_ROLE_KEY'),

  // Authentication
  required('JWT_SECRET'),
  optional('JWT_EXPIRY', '3600'),
  optional('JWT_REFRESH_EXPIRY', '604800'),
  // Recommended: set a separate secret for refresh tokens so they cannot be
  // substituted for access tokens. Falls back to JWT_SECRET + '_refresh'.
  optional('JWT_REFRESH_SECRET'),

  // AI/Anthropic Claude
  required('ANTHROPIC_API_KEY'),

  // Stripe
  required('STRIPE_SECRET_KEY'),
  required('STRIPE_WEBHOOK_SECRET'),
  required('STRIPE_PRICE_STARTER'),
  required('STRIPE_PRICE_PRO'),
  required('STRIPE_PRICE_ENTERPRISE'),

  // Redis (optional)
  optional('REDIS_URL'),

  // Email
  optional('EMAIL_PROVIDER', 'sendgrid'),
  optional('SENDGRID_API_KEY'),
  optional('SMTP_HOST'),
  optional('SMTP_PORT', '587'),
  optional('SMTP_USER'),
  optional('SMTP_PASS'),
  optional('EMAIL_FROM', 'noreply@jtsa-tool.com'),

  // App
  optional('APP_URL', 'http://localhost:3000'),
  optional('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3001'),
];

/**
 * Validate all environment variables
 */
const validateEnv = () => {
  const errors = [];
  const warnings = [];

  for (const config of envConfig) {
    const value = process.env[config.name];

    // Check if required
    if (config.required && !value) {
      errors.push(config.error);
      continue;
    }

    // Skip validation if optional and not set
    if (!config.required && !value) {
      continue;
    }

    // Validate format
    if (config.validate && value && !config.validate(value)) {
      errors.push(config.error);
    }
  }

  // Validate email provider configuration
  const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';
  if (emailProvider === 'sendgrid') {
    if (!process.env.SENDGRID_API_KEY) {
      errors.push('SENDGRID_API_KEY is required when EMAIL_PROVIDER is "sendgrid"');
    }
  } else if (emailProvider === 'smtp') {
    if (!process.env.SMTP_HOST) {
      errors.push('SMTP_HOST is required when EMAIL_PROVIDER is "smtp"');
    }
    if (!process.env.SMTP_USER) {
      errors.push('SMTP_USER is required when EMAIL_PROVIDER is "smtp"');
    }
    if (!process.env.SMTP_PASS) {
      errors.push('SMTP_PASS is required when EMAIL_PROVIDER is "smtp"');
    }
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('localhost')) {
      errors.push('SUPABASE_URL must be production URL in production environment');
    }

    if (process.env.JWT_SECRET === 'your-secret-key-here') {
      errors.push('JWT_SECRET must be changed in production');
    }

    if (process.env.STRIPE_SECRET_KEY?.includes('test')) {
      warnings.push('⚠️  Warning: Using Stripe test keys in production');
    }
  }

  return { errors, warnings };
};

/**
 * Exit if validation fails
 */
const assertEnv = () => {
  const { errors, warnings } = validateEnv();

  // Print warnings
  warnings.forEach(w => console.warn(`${w}`));

  // Exit on errors
  if (errors.length > 0) {
    console.error('\n❌ Environment Validation Failed:\n');
    errors.forEach(e => console.error(`  - ${e}`));
    console.error('\nPlease check your .env file and try again.\n');
    process.exit(1);
  }

  console.log('✓ Environment validation passed');
};

module.exports = {
  validateEnv,
  assertEnv,
  required,
  optional,
  url,
  port,
};
