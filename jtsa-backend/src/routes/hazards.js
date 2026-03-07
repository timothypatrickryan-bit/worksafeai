const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { createHazardSchema, acknowledgeHazardSchema } = require('../validation/schemas');
const aiService = require('../ai/openaiService');

// POST /api/jtsa/:id/hazards - create new hazard (user-submitted, not AI)
router.post('/jtsa/:id/hazards',
  authenticateToken,
  validateBody(createHazardSchema),
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;

      // Check JTSA access
      const { data: jtsa } = await supabase
        .from('jtsas')
        .select('project:projects(company_id)')
        .eq('id', req.params.id)
        .single();

      if (!jtsa || jtsa.project.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Create hazard
      const { data: hazard, error } = await supabase
        .from('hazards')
        .insert({
          jtsa_id: req.params.id,
          description: req.validatedBody.description,
          severity: req.validatedBody.severity || 'medium',
          ai_suggested: false,
        })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(hazard);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/jtsa/:id/hazards - list all hazards for a JTSA
router.get('/jtsa/:id/hazards',
  authenticateToken,
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;

      // Check JTSA access
      const { data: jtsa } = await supabase
        .from('jtsas')
        .select('project:projects(company_id)')
        .eq('id', req.params.id)
        .single();

      if (!jtsa || jtsa.project.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { data: hazards, error } = await supabase
        .from('hazards')
        .select('*, mitigations(*)')
        .eq('jtsa_id', req.params.id)
        .order('severity', { ascending: false });

      if (error) throw error;
      res.json(hazards);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// PATCH /api/hazards/:id - acknowledge hazard
router.patch('/hazards/:id',
  authenticateToken,
  validateBody(acknowledgeHazardSchema),
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;

      const { data: hazard } = await supabase
        .from('hazards')
        .select('jtsa:jtsas(project:projects(company_id))')
        .eq('id', req.params.id)
        .single();

      if (!hazard || hazard.jtsa.project.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { data: updated, error } = await supabase
        .from('hazards')
        .update({
          user_acknowledged: req.validatedBody.userAcknowledged,
          acknowledged_at: req.validatedBody.userAcknowledged ? new Date() : null,
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

// GET /api/hazards/:id - get hazard details with mitigations
router.get('/hazards/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;

      const { data: hazard, error } = await supabase
        .from('hazards')
        .select(`
          *,
          jtsa:jtsas(project:projects(company_id)),
          mitigations(*)
        `)
        .eq('id', req.params.id)
        .single();

      if (!hazard || hazard.jtsa.project.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(hazard);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
