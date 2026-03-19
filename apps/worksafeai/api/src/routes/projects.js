const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { verifyCompanyAccess } = require('../middleware/companyAccess');
const { validateBody } = require('../middleware/validation');
const { createProjectSchema, updateProjectSchema } = require('../validation/schemas');
const { checkProjectLimit } = require('../middleware/featureLimit');

// POST /api/companies/:cid/projects - create project
router.post('/companies/:cid/projects', 
  authenticateToken, 
  verifyCompanyAccess,
  checkProjectLimit,
  validateBody(createProjectSchema),
  async (req, res, next) => {
    try {
      const supabase = req.app.locals.supabase;
      
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          company_id: req.user.companyId, // Force from token, not URL param (security)
          name: req.validatedBody.name,
          description: req.validatedBody.description,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/companies/:cid/projects - list projects
router.get('/companies/:cid/projects',
  authenticateToken,
  verifyCompanyAccess,
  async (req, res, next) => {
    try {
      const supabase = req.app.locals.supabase;
      const { status } = req.query;

      let query = supabase
        .from('projects')
        .select('*')
        .eq('company_id', req.params.cid);

      if (status) {
        query = query.eq('status', status);
      }

      const { data: projects, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      res.json(projects);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/projects/:id - get project details
router.get('/projects/:id',
  authenticateToken,
  async (req, res, next) => {
    try {
      const supabase = req.app.locals.supabase;
      
      // Validate UUID format to prevent injection
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ error: 'Invalid project ID format' });
      }

      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error || !project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Verify access to company
      if (project.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(project);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/projects/:id - update project (owner/admin/project_manager only)
router.patch('/projects/:id',
  authenticateToken,
  authorizeRole(['owner', 'admin', 'project_manager']),
  validateBody(updateProjectSchema),
  async (req, res, next) => {
    try {
      const supabase = req.app.locals.supabase;
      
      // Validate UUID format to prevent injection
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ error: 'Invalid project ID format' });
      }

      // Check access first
      const { data: project } = await supabase
        .from('projects')
        .select('company_id')
        .eq('id', req.params.id)
        .single();

      if (!project || project.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { data: updated, error } = await supabase
        .from('projects')
        .update({
          ...req.validatedBody,
          updated_at: new Date(),
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/projects/:id - archive project (owner/admin only)
router.delete('/projects/:id',
  authenticateToken,
  authorizeRole(['owner', 'admin']),
  async (req, res, next) => {
    try {
      const supabase = req.app.locals.supabase;
      
      // Validate UUID format to prevent injection
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ error: 'Invalid project ID format' });
      }

      // Check access first
      const { data: project } = await supabase
        .from('projects')
        .select('company_id')
        .eq('id', req.params.id)
        .single();

      if (!project || project.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Soft delete by marking as archived
      const { data: updated, error } = await supabase
        .from('projects')
        .update({ status: 'archived', updated_at: new Date() })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      res.json({ message: 'Project archived', project: updated });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
