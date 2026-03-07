const express = require('express');
const router = express.Router();

/**
 * Health Check Endpoints
 * Used by load balancers and monitoring services
 */

// GET /health - Basic liveness check
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// GET /health/ready - Readiness check (dependencies OK)
router.get('/ready', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const cacheService = req.app.locals.cacheService;

    // Check Supabase connection
    const { error: dbError } = await supabase
      .from('companies')
      .select('id')
      .limit(1);

    if (dbError && dbError.code !== 'PGRST116') {
      // PGRST116 is "no rows" which is fine
      throw new Error(`Database check failed: ${dbError.message}`);
    }

    // Check Redis connection (optional)
    const cacheStatus = cacheService?.connected ? 'connected' : 'disabled';

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
        cache: cacheStatus,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /health/live - Kubernetes liveness probe
router.get('/live', (req, res) => {
  res.json({ alive: true });
});

module.exports = router;
