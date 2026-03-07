const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { verifyCompanyAccess } = require('../middleware/companyAccess');
const { validateBody } = require('../middleware/validation');
const { createProjectSchema, updateProjectSchema } = require('../validation/schemas');

// POST /api/companies/:cid/projects - create project
router.post('/companies/:cid/projects', 
  authenticateToken, 
  verifyCompanyAccess,
  validateBody(createProjectSchema),
  async (req, res) => {
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
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/companies/:cid/projects - list projects
router.get('/companies/:cid/projects',
  authenticateToken,
  verifyCompanyAccess,
  async (req, res) => {
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
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/projects/:id - get project details
router.get('/projects/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;

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
      res.status(500).json({ error: error.message });
    }
  }
);

// PATCH /api/projects/:id - update project
router.patch('/projects/:id',
  authenticateToken,
  validateBody(updateProjectSchema),
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;

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
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE /api/projects/:id - archive project
router.delete('/projects/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;

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
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
