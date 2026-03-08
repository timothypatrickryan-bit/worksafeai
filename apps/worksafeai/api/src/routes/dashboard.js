const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { verifyCompanyAccess } = require('../middleware/companyAccess');
const { validateQuery } = require('../middleware/validation');
const { cachedResponse } = require('../middleware/cache');
const { paginationSchema } = require('../validation/schemas');
const cacheService = require('../services/cacheService');

// GET /api/companies/:id/dashboard - dashboard overview
router.get('/companies/:id/dashboard',
  authenticateToken,
  verifyCompanyAccess,
  cachedResponse(
    (req) => cacheService.keys.dashboardStats(req.params.id),
    cacheService.TTL.DASHBOARD_STATS
  ),
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;
      const companyId = req.params.id;

      // Get company info (including industry)
      const { data: company } = await supabase
        .from('companies')
        .select('id, name, industry, subscription_tier, trial_ends_at, billing_active, created_at')
        .eq('id', companyId)
        .single();

      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Get employee count
      const { data: employees } = await supabase
        .from('users')
        .select('id')
        .eq('company_id', companyId);

      // Get today's JTSAs (no projects needed, direct company query)
      const today = new Date().toISOString().split('T')[0];
      const { data: todaysJtsas } = await supabase
        .from('jtsas')
        .select('id')
        .eq('company_id', companyId)
        .eq('date', today);

      // Get completed JTSAs (this week)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: completedJtsas } = await supabase
        .from('jtsas')
        .select('id')
        .eq('company_id', companyId)
        .gte('date', weekAgo)
        .eq('status', 'completed');

      // Get total JTSAs created
      const { data: totalJtsas } = await supabase
        .from('jtsas')
        .select('id')
        .eq('company_id', companyId);

      res.json({
        company: {
          id: company.id,
          name: company.name,
          industry: company.industry,
          subscriptionTier: company.subscription_tier,
          trialEndsAt: company.trial_ends_at,
          billingActive: company.billing_active,
          createdAt: company.created_at,
        },
        stats: {
          totalEmployees: employees?.length || 0,
          totalJtsas: totalJtsas?.length || 0,
          todaysJtsas: todaysJtsas?.length || 0,
          completedThisWeek: completedJtsas?.length || 0,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/companies/:id/audit-log - audit trail (admin/owner only)
router.get('/companies/:id/audit-log',
  authenticateToken,
  authorizeRole(['owner', 'admin']),
  verifyCompanyAccess,
  validateQuery(paginationSchema),
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;
      const { limit, offset, action, user_id } = req.validatedQuery;

      let query = supabase
        .from('audit_logs')
        .select(`
          id,
          action,
          resource_type,
          resource_id,
          details,
          timestamp,
          user:users(id, full_name, email)
        `)
        .eq('company_id', req.params.id);

      if (action) {
        query = query.eq('action', action);
      }

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      const { data: logs, error } = await query
        .order('timestamp', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      if (error) throw error;

      res.json({
        data: logs,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
