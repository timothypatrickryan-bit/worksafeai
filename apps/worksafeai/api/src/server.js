let bootError = null;
try {
require('dotenv').config();
} catch (e) { /* dotenv optional */ }

let express, cors, helmet, createClient, cacheService, MigrationService, assertEnv, errorHandler, requestIdMiddleware, structuredLogger;

try {
  express = require('express');
  cors = require('cors');
  helmet = require('helmet');
  ({ createClient } = require('@supabase/supabase-js'));
  cacheService = require('./services/cacheService');
  MigrationService = require('./services/migrationService');
  ({ assertEnv } = require('./config/envValidation'));
  ({ errorHandler, requestIdMiddleware, structuredLogger } = require('./middleware/errorHandler'));

  // Validate environment variables
  assertEnv();
} catch (e) {
  bootError = e;
  console.error('🔥 BOOT ERROR:', e.message);
  console.error(e.stack);
}

// If boot failed, export a diagnostic handler
if (bootError) {
  const fallbackExpress = require('express');
  const fallbackApp = fallbackExpress();
  fallbackApp.use((req, res) => {
    res.status(503).json({
      error: 'Server failed to start',
      message: bootError.message,
      stack: bootError.stack,
    });
  });
  module.exports = fallbackApp;
  return; // This won't work at top level in CJS, need to wrap differently
}

// Initialize app
const app = express();

// Security headers
app.use(helmet());

// CORS - whitelist allowed origins
const defaultOrigins = 'http://localhost:3000,http://localhost:3001,http://localhost:5173,https://worksafeai.elevationaiwork.com,https://superadmin.elevationaiwork.com';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || defaultOrigins).split(',').map(o => o.trim());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(requestIdMiddleware);
app.use(structuredLogger);

// Webhook endpoint must be registered BEFORE body parsing middleware
// This is because Stripe webhooks require raw body for signature verification
const webhookMiddleware = express.raw({ type: 'application/json' });
const webhookHandler = async (req, res) => {
  const stripeService = require('./services/stripeService');
  const signature = req.headers['stripe-signature'];

  try {
    const event = stripeService.verifyWebhookSignature(req.body, signature);
    const supabase = app.locals.supabase;
    await stripeService.handleWebhookEvent(event, supabase);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
};
app.post('/api/billing/webhook', webhookMiddleware, webhookHandler);
app.post('/billing/webhook', webhookMiddleware, webhookHandler);

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
app.use('/api/projects/:pid/jtsa', aiLimiter);
app.use('/projects/:pid/jtsa', aiLimiter);
app.use('/api/hazards/:id/mitigations', aiLimiter);
app.use('/hazards/:id/mitigations', aiLimiter);

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
app.use('/auth/login', authLimiter);
app.use('/api/auth/accept-invite', authLimiter);
app.use('/auth/accept-invite', authLimiter);
app.use('/api/auth/refresh-token', tokenLimiter);
app.use('/auth/refresh-token', tokenLimiter);
app.use('/api/auth/verify-email', tokenLimiter);
app.use('/auth/verify-email', tokenLimiter);
app.use('/api/auth/reset-password', tokenLimiter);
app.use('/auth/reset-password', tokenLimiter);

// Email invite rate limiting (prevent spam)
const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 invites per hour
  message: 'Too many invites sent, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/companies/:id/users', inviteLimiter);
app.use('/companies/:id/users', inviteLimiter);

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
app.use('/companies', enumerationLimiter);
app.use('/api/projects', enumerationLimiter);
app.use('/projects', enumerationLimiter);

// Password reset rate limiting (prevent email enumeration)
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 password reset requests per hour
  message: 'Too many password reset attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/forgot-password', forgotPasswordLimiter);
app.use('/auth/forgot-password', forgotPasswordLimiter);

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

// Routes — mounted at both /api/* (legacy) and /* (production Vercel routing)
const authRoutes = require('./routes/auth');
const companiesRoutes = require('./routes/companies');
const companyRoutes = require('./routes/company');
const projectsRoutes = require('./routes/projects');
const jtsaRoutes = require('./routes/jtsa');
const hazardsRoutes = require('./routes/hazards');
const mitigationsRoutes = require('./routes/mitigations');
const dashboardRoutes = require('./routes/dashboard');
const billingRoutes = require('./routes/billing');
const adminMigrationsRoutes = require('./routes/admin-migrations');
const pdfsRoutes = require('./routes/pdfs');

// Mount at /api/* (for local dev / direct calls)
app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api', companyRoutes);
app.use('/api', projectsRoutes);
app.use('/api', jtsaRoutes);
app.use('/api', hazardsRoutes);
app.use('/api', mitigationsRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api', adminMigrationsRoutes);
app.use('/api/pdfs', pdfsRoutes);

// Mount at /* (Vercel serverless — frontend calls /auth/register, not /api/auth/register)
app.use('/auth', authRoutes);
app.use('/companies', companiesRoutes);
app.use('/', companyRoutes);
app.use('/', projectsRoutes);
app.use('/', jtsaRoutes);
app.use('/', hazardsRoutes);
app.use('/', mitigationsRoutes);
app.use('/', dashboardRoutes);
app.use('/billing', billingRoutes);
app.use('/', adminMigrationsRoutes);
app.use('/pdfs', pdfsRoutes);

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
