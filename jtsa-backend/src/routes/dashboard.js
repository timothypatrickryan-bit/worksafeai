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

      // Get company info
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      // Get employee count
      const { data: employees } = await supabase
        .from('users')
        .select('id')
        .eq('company_id', companyId);

      // Get project count
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('company_id', companyId)
        .eq('status', 'active');

      // Get today's JTSAs
      const today = new Date().toISOString().split('T')[0];
      let todaysJtsas = [];
      if (projects && projects.length > 0) {
        const projectIds = projects.map(p => p.id);
        const result = await supabase
          .from('jtsas')
          .select('id')
          .in('project_id', projectIds)
          .eq('date', today);
        todaysJtsas = result.data || [];
      }

      // Get completed JTSAs (this week)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      let completedJtsas = [];
      if (projects && projects.length > 0) {
        const projectIds = projects.map(p => p.id);
        const result = await supabase
          .from('jtsas')
          .select('id')
          .in('project_id', projectIds)
          .gte('date', weekAgo)
          .eq('status', 'completed');
        completedJtsas = result.data || [];
      }

      res.json({
        company,
        stats: {
          totalEmployees: employees?.length || 0,
          totalProjects: projects?.length || 0,
          todaysJtsas: todaysJtsas?.length || 0,
          completedThisWeek: completedJtsas?.length || 0,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/companies/:id/jtsa-list - list all JTSAs with filtering
router.get('/companies/:id/jtsa-list',
  authenticateToken,
  verifyCompanyAccess,
  validateQuery(paginationSchema),
  cachedResponse(
    (req) => cacheService.keys.jtsaList(req.params.id, req.validatedQuery?.status, req.validatedQuery?.date),
    cacheService.TTL.JTSA_LIST
  ),
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;
      const { status, date, limit, offset } = req.validatedQuery;

      // Get all projects for this company
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('company_id', req.params.id);

      const projectIds = (projects && projects.length > 0) ? projects.map(p => p.id) : null;
      
      let query = supabase
        .from('jtsas')
        .select(`
          id,
          project_id,
          date,
          task_description,
          status,
          created_by,
          pdf_url,
          created_at,
          updated_at,
          project:projects(name),
          created_by_user:users!created_by(full_name, email)
        `);

      // Only apply .in() filter if there are projects
      if (projectIds) {
        query = query.in('project_id', projectIds);
      } else {
        // If no projects exist, return empty result set
        query = query.eq('project_id', null);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (date) {
        query = query.eq('date', date);
      }

      const { data: jtsas, error, count } = await query
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .count('exact')
        .range(offset, offset + limit - 1);

      if (error) throw error;

      res.json({
        data: jtsas,
        pagination: {
          total: count,
          limit,
          offset,
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
          *,
          user:users(full_name, email)
        `)
        .eq('company_id', req.params.id);

      if (action) {
        query = query.eq('action', action);
      }

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      const { data: logs, error, count } = await query
        .order('timestamp', { ascending: false })
        .count('exact')
        .range(offset, offset + limit - 1);

      if (error) throw error;

      res.json({
        data: logs,
        pagination: {
          total: count,
          limit,
          offset,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
