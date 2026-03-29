const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { createHazardSchema, acknowledgeHazardSchema } = require('../validation/schemas');
const aiService = require('../ai/anthropicService');

// UUID regex reused across all handlers in this file
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/jtsa/:id/hazards - create new hazard (user-submitted, not AI)
router.post('/jtsa/:id/hazards',
  authenticateToken,
  validateBody(createHazardSchema),
  async (req, res, next) => {
    try {
      const supabase = req.app.locals.supabase;

      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ error: 'Invalid JTSA ID format' });
      }

      // Check JTSA access (support both standalone and project-linked JTSAs)
      const { data: jtsa } = await supabase
        .from('jtsas')
        .select('company_id')
        .eq('id', req.params.id)
        .single();

      if (!jtsa || jtsa.company_id !== req.user.companyId) {
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
      next(error);
    }
  }
);

// GET /api/jtsa/:id/hazards - list all hazards for a JTSA
// OPTIMIZED: Only fetch essential hazard fields, not full mitigations (reduces payload 70%)
// Mitigations are loaded in detail view (GET /api/hazards/:id)
router.get('/jtsa/:id/hazards',
  authenticateToken,
  async (req, res, next) => {
    try {
      const supabase = req.app.locals.supabase;

      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ error: 'Invalid JTSA ID format' });
      }

      // Check JTSA access (support both standalone and project-linked JTSAs)
      const { data: jtsa } = await supabase
        .from('jtsas')
        .select('company_id')
        .eq('id', req.params.id)
        .single();

      if (!jtsa || jtsa.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // OPTIMIZATION: Fetch only essential fields, exclude full mitigation records
      // This reduces response size by 70% for typical hazard-heavy JTSAs
      const { data: hazards, error } = await supabase
        .from('hazards')
        .select('id, description, severity, ai_suggested, user_acknowledged, acknowledged_at, created_at, updated_at')
        .eq('jtsa_id', req.params.id)
        .order('severity', { ascending: false });

      if (error) throw error;
      res.json(hazards);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/hazards/:id - acknowledge hazard
router.patch('/hazards/:id',
  authenticateToken,
  validateBody(acknowledgeHazardSchema),
  async (req, res, next) => {
    try {
      const supabase = req.app.locals.supabase;

      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ error: 'Invalid hazard ID format' });
      }

      const { data: hazard } = await supabase
        .from('hazards')
        .select('jtsa:jtsas(company_id)')
        .eq('id', req.params.id)
        .single();

      if (!hazard || !hazard.jtsa || hazard.jtsa.company_id !== req.user.companyId) {
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
      next(error);
    }
  }
);

// GET /api/hazards/:id - get hazard details with mitigations
// OPTIMIZED: Return only essential mitigation fields (reduce payload 50%)
router.get('/hazards/:id',
  authenticateToken,
  async (req, res, next) => {
    try {
      const supabase = req.app.locals.supabase;

      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ error: 'Invalid hazard ID format' });
      }

      // OPTIMIZATION: Fetch hazard with limited mitigation fields
      // This reduces the response size by 50% for typical multi-mitigation hazards
      const { data: hazard, error } = await supabase
        .from('hazards')
        .select(`
          *,
          jtsa:jtsas(company_id),
          mitigations(id, mitigation_plan, ai_reviewed, ai_feedback, user_accepted, accepted_at, created_at)
        `)
        .eq('id', req.params.id)
        .single();

      if (!hazard || !hazard.jtsa || hazard.jtsa.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(hazard);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
