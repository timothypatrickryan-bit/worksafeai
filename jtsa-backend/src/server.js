require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createClient } = require('@supabase/supabase-js');
const cacheService = require('./services/cacheService');
const MigrationService = require('./services/migrationService');
const { assertEnv } = require('./config/envValidation');
const { errorHandler, requestIdMiddleware, structuredLogger } = require('./middleware/errorHandler');

// Validate environment variables
assertEnv();

// Initialize app
const app = express();

// Security headers
app.use(helmet());

// CORS - whitelist allowed origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001').split(',');
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Middleware
app.use(requestIdMiddleware);
app.use(structuredLogger);
app.use(express.json());

// Rate limiting
const rateLimit = require('express-rate-limit');

// AI endpoints rate limiting (prevent cost explosion)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 AI requests per 15 minutes
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/projects/:pid/jtsa', aiLimiter); // JTSA creation (generates hazards)
app.use('/api/hazards/:id/mitigations', aiLimiter); // Mitigation creation (AI review)

// Auth endpoints rate limiting (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth attempts per 15 minutes
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
const tokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 token verification attempts per 15 minutes
  message: 'Too many verification attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/accept-invite', authLimiter);
app.use('/api/auth/refresh-token', tokenLimiter);
app.use('/api/auth/verify-email', tokenLimiter);
app.use('/api/auth/reset-password', tokenLimiter);

// Email invite rate limiting (prevent spam)
const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 invites per hour
  message: 'Too many invites sent, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/companies/:id/users', inviteLimiter);

// CSRF/Origin validation middleware
const validateOrigin = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const origin = req.get('origin') || req.get('referer');
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
    
    // Allow requests with matching origin
    if (!origin || !allowedOrigins.some(allowed => origin.startsWith(allowed.trim()))) {
      // Don't block, just log (CSRF protection is mainly for browsers)
      console.warn(`Potential CSRF: Origin ${origin} not in whitelist`);
    }
  }
  next();
};
app.use(validateOrigin);

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Make Supabase available to routes
app.locals.supabase = supabase;

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api', require('./routes/projects'));
app.use('/api', require('./routes/jtsa'));
app.use('/api', require('./routes/hazards'));
app.use('/api', require('./routes/mitigations'));
app.use('/api', require('./routes/dashboard'));
app.use('/api/billing', require('./routes/billing'));

// Protected PDF download (not static)
// Use: GET /api/pdfs/:jtsa_id (authenticateToken verifies access)
app.use('/api/pdfs', require('./routes/pdfs'));

// Health checks
app.use('/health', require('./routes/health'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware (MUST be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  // Run database migrations
  console.log('\n📦 Running database migrations...');
  const migrationService = new MigrationService(supabase);
  await migrationService.initTable();
  const migrationSuccess = await migrationService.runAll();
  if (!migrationSuccess && process.env.NODE_ENV === 'production') {
    console.error('❌ Critical: Migrations failed in production');
    process.exit(1);
  }

  // Initialize cache (optional, logs warning if Redis not available)
  await cacheService.init();

  // Make cache available to routes
  app.locals.cacheService = cacheService;

  app.listen(PORT, () => {
    console.log(`\n✓ JTSA Backend running on port ${PORT}`);
    console.log(`✓ Cache service: ${cacheService.connected ? 'enabled' : 'disabled'}`);
    console.log('✓ Ready to accept requests\n');
  });
};

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
