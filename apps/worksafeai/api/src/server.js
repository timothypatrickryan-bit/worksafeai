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

// Webhook endpoint must be registered BEFORE body parsing middleware
// This is because Stripe webhooks require raw body for signature verification
app.post('/api/billing/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const stripeService = require('./services/stripeService');
    const signature = req.headers['stripe-signature'];

    try {
      const event = stripeService.verifyWebhookSignature(req.body, signature);
      const supabase = app.locals.supabase;

      // Handle event
      await stripeService.handleWebhookEvent(event, supabase);

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Parse JSON bodies for all other routes (limit body size to prevent DoS)
app.use(express.json({ limit: '1mb' }));

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

// Data enumeration rate limiting (prevent reconnaissance attacks)
const enumerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 enumeration requests per 15 minutes
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limit for requests that present a properly-formed Bearer token.
    // We only check format here (not validity) to avoid circular auth-before-rate-limit
    // issues, but this still meaningfully raises the bar over checking header presence.
    const auth = req.headers.authorization;
    return typeof auth === 'string' && /^Bearer\s+\S{10,}/i.test(auth);
  },
});
app.use('/api/companies', enumerationLimiter);
app.use('/api/projects', enumerationLimiter);

// Password reset rate limiting (prevent email enumeration)
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 password reset requests per hour
  message: 'Too many password reset attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/forgot-password', forgotPasswordLimiter);

// CSRF/Origin validation middleware
const validateOrigin = (req, res, next) => {
  // Skip validation for GET requests and certain safe operations
  const isReadOnly = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  if (isReadOnly) {
    return next();
  }

  if (process.env.NODE_ENV === 'production') {
    const origin = req.get('origin') || req.get('referer')?.split('?')[0]?.split('#')[0];
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
    
    // Strict validation: origin must exactly match an allowed origin (for API calls)
    // For browser requests, check Referer header origin
    const isValidOrigin = origin && allowedOrigins.some(allowed => {
      try {
        const allowedUrl = new URL(allowed.startsWith('http') ? allowed : `https://${allowed}`);
        const originUrl = new URL(origin);
        return originUrl.origin === allowedUrl.origin;
      } catch (e) {
        return false;
      }
    });

    if (!isValidOrigin) {
      console.warn(`CSRF blocked: Origin ${origin} not in whitelist. Allowed: ${allowedOrigins.join(', ')}`);
      return res.status(403).json({ error: 'CSRF validation failed' });
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
app.use('/api', require('./routes/company'));
app.use('/api', require('./routes/projects'));
app.use('/api', require('./routes/jtsa'));
app.use('/api', require('./routes/hazards'));
app.use('/api', require('./routes/mitigations'));
app.use('/api', require('./routes/dashboard'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api', require('./routes/admin-migrations'));

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
  // Run database migrations (non-blocking in development)
  console.log('\n📦 Running database migrations...');
  const migrationService = new MigrationService(supabase);
  try {
    await migrationService.initTable();
    const migrationSuccess = await migrationService.runAll();
    if (!migrationSuccess && process.env.NODE_ENV === 'production') {
      console.error('❌ Critical: Migrations failed in production');
      process.exit(1);
    }
  } catch (migrationError) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Critical: Migration error in production:', migrationError);
      process.exit(1);
    } else {
      console.warn('⚠️ Migration warning (development):', migrationError.message);
      // Continue in development
    }
  }

  // Initialize cache (optional, logs warning if Redis not available)
  await cacheService.init();

  // Make cache available to routes
  app.locals.cacheService = cacheService;

  return app.listen(PORT, () => {
    console.log(`\n✓ JTSA Backend running on port ${PORT}`);
    console.log(`✓ Cache service: ${cacheService.connected ? 'enabled' : 'disabled'}`);
    console.log('✓ Ready to accept requests\n');
  });
};

let server;

startServer().then(s => {
  server = s;
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  // Give in-flight requests 10s to complete, then force exit
  const forceTimer = setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
  forceTimer.unref(); // Don't block event loop from exiting naturally

  if (server) {
    await new Promise((resolve) => {
      server.close(() => {
        console.log('HTTP server closed');
        resolve();
      });
    });
  }
  
  // Disconnect Redis cache
  try {
    await cacheService.disconnect();
  } catch (err) {
    console.error('Error disconnecting cache:', err.message);
  }

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
