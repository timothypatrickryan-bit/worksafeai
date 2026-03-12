require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createClient } = require('@supabase/supabase-js');

// Environment validation
const requiredEnv = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
];

const missingEnv = requiredEnv.filter(env => !process.env[env]);
if (missingEnv.length > 0) {
  console.error('❌ Missing environment variables:', missingEnv.join(', '));
  process.exit(1);
}

// Initialize app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const defaultOrigins = 'http://localhost:3000,http://localhost:5173,https://worksafeai.elevationaiwork.com,https://superadmin.elevationaiwork.com';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || defaultOrigins)
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));

// Health check endpoint (must be first)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Initialize Supabase client
let supabase = null;
try {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  console.log('✓ Supabase client initialized');
} catch (error) {
  console.error('❌ Failed to initialize Supabase:', error.message);
  process.exit(1);
}

// Make supabase available to routes
app.locals.supabase = supabase;

// ============= RATE LIMITING =============
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development',
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 new accounts per hour
  message: 'Too many registration attempts, try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development',
});

// ============= AUTH ROUTES =============
const registerRoute = require('./routes/auth/register');
const loginRoute = require('./routes/auth/login');
const refreshRoute = require('./routes/auth/refresh');
const logoutRoute = require('./routes/auth/logout');
const { authenticateToken } = require('./middleware/auth');

app.post('/auth/register', registerLimiter, registerRoute);
app.post('/auth/login', loginLimiter, loginRoute);
app.post('/auth/refresh', refreshRoute);
app.post('/auth/logout', authenticateToken, logoutRoute);

// ============= COMPANY ROUTES =============
const getCompanyRoute = require('./routes/company/getCompany');
const updateCompanyRoute = require('./routes/company/updateCompany');
const { verifyCompanyAccess } = require('./middleware/companyAccess');

app.get('/company', authenticateToken, verifyCompanyAccess, getCompanyRoute);
app.put('/company', authenticateToken, verifyCompanyAccess, updateCompanyRoute);

// ============= PROJECT ROUTES =============
const listProjectsRoute = require('./routes/projects/listProjects');
const createProjectRoute = require('./routes/projects/createProject');
const getProjectRoute = require('./routes/projects/getProject');
const updateProjectRoute = require('./routes/projects/updateProject');

app.get('/projects', authenticateToken, listProjectsRoute);
app.post('/projects', authenticateToken, createProjectRoute);
app.get('/projects/:projectId', authenticateToken, getProjectRoute);
app.put('/projects/:projectId', authenticateToken, updateProjectRoute);

// ============= JTSA ROUTES =============
const createJtsaRoute = require('./routes/jtsa/createJtsa');
const listJtsasRoute = require('./routes/jtsa/listJtsas');
const getJtsaRoute = require('./routes/jtsa/getJtsa');
const updateJtsaRoute = require('./routes/jtsa/updateJtsa');
const completeJtsaRoute = require('./routes/jtsa/completeJtsa');

app.post('/jtsa', authenticateToken, createJtsaRoute);
app.get('/jtsa', authenticateToken, listJtsasRoute);
app.get('/jtsa/:jtsaId', authenticateToken, getJtsaRoute);
app.put('/jtsa/:jtsaId', authenticateToken, updateJtsaRoute);
app.post('/jtsa/:jtsaId/complete', authenticateToken, completeJtsaRoute);

// ============= HAZARD ROUTES =============
const listHazardsRoute = require('./routes/hazards/listHazards');
const acknowledgeHazardRoute = require('./routes/hazards/acknowledgeHazard');

app.get('/hazards', authenticateToken, listHazardsRoute);
app.post('/hazards/:hazardId/acknowledge', authenticateToken, acknowledgeHazardRoute);

// ============= MITIGATION ROUTES =============
const listMitigationsRoute = require('./routes/mitigations/listMitigations');
const acceptMitigationRoute = require('./routes/mitigations/acceptMitigation');
const rejectMitigationRoute = require('./routes/mitigations/rejectMitigation');

app.get('/mitigations', authenticateToken, listMitigationsRoute);
app.post('/mitigations/:mitigationId/accept', authenticateToken, acceptMitigationRoute);
app.post('/mitigations/:mitigationId/reject', authenticateToken, rejectMitigationRoute);

// ============= DASHBOARD ROUTES =============
const dashboardRoute = require('./routes/dashboard/dashboard');
const auditLogRoute = require('./routes/dashboard/auditLog');

app.get('/dashboard', authenticateToken, dashboardRoute);
app.get('/audit-log', authenticateToken, auditLogRoute);

// ============= ERROR HANDLER =============
app.use((error, req, res, next) => {
  console.error('❌ Error:', {
    message: error.message,
    status: error.status || 500,
    path: req.path,
    method: req.method,
  });

  const status = error.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
  });
});

// ============= 404 HANDLER =============
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
  });
});

// ============= LOCAL DEVELOPMENT SERVER =============
// Only start server locally (not on Vercel)
if (!process.env.VERCEL && require.main === module) {
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`\n✓ WorkSafeAI API running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('✓ Ready to accept requests\n');
  });
}

// ============= EXPORT FOR VERCEL =============
module.exports = app;
