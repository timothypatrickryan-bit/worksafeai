const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { createMitigationSchema, acceptMitigationSchema } = require('../validation/schemas');
const aiService = require('../ai/anthropicService');

// UUID regex reused across all handlers in this file
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/hazards/:id/mitigations - create mitigation (triggers AI review)
router.post('/hazards/:id/mitigations',
  authenticateToken,
  validateBody(createMitigationSchema),
  async (req, res, next) => {
    try {
      const supabase = req.app.locals.supabase;

      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ error: 'Invalid hazard ID format' });
      }

      // Check hazard access (support both standalone and project-linked JTSAs)
      const { data: hazard } = await supabase
        .from('hazards')
        .select('*, jtsa:jtsas(company_id)')
        .eq('id', req.params.id)
        .single();

      if (!hazard || !hazard.jtsa || hazard.jtsa.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Create mitigation record first
      const { data: mitigation, error: createError } = await supabase
        .from('mitigations')
        .insert({
          hazard_id: req.params.id,
          mitigation_plan: req.validatedBody.mitigationPlan,
          ai_reviewed: false,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Get AI review asynchronously (don't block request)
      aiService.reviewMitigation(hazard.description, req.validatedBody.mitigationPlan)
        .then(review => {
          // Update mitigation with AI feedback
          supabase
            .from('mitigations')
            .update({
              ai_reviewed: true,
              ai_feedback: review.feedback,
              updated_at: new Date(),
            })
            .eq('id', mitigation.id)
            .then(() => {
              console.log(`AI review completed for mitigation ${mitigation.id}`);
            })
            .catch(err => {
              console.error(`Failed to update mitigation with AI review: ${err.message}`);
            });
        })
        .catch(err => {
          console.error(`AI review failed for mitigation ${mitigation.id}: ${err.message}`);
          // Update with error state
          supabase
            .from('mitigations')
            .update({
              ai_reviewed: false,
              ai_feedback: 'AI review pending. Please try again.',
              updated_at: new Date(),
            })
            .eq('id', mitigation.id)
            .catch(() => {});
        });

      res.status(201).json(mitigation);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/hazards/:id/mitigations - list mitigations for a hazard
router.get('/hazards/:id/mitigations',
  authenticateToken,
  async (req, res, next) => {
    try {
      const supabase = req.app.locals.supabase;

      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ error: 'Invalid hazard ID format' });
      }

      // Check hazard access (support both standalone and project-linked JTSAs)
      const { data: hazard } = await supabase
        .from('hazards')
        .select('jtsa:jtsas(company_id)')
        .eq('id', req.params.id)
        .single();

      if (!hazard || !hazard.jtsa || hazard.jtsa.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { data: mitigations, error } = await supabase
        .from('mitigations')
        .select('*')
        .eq('hazard_id', req.params.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(mitigations);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/mitigations/:id - accept or reject mitigation
router.patch('/mitigations/:id',
  authenticateToken,
  validateBody(acceptMitigationSchema),
  async (req, res, next) => {
    try {
      const supabase = req.app.locals.supabase;

      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ error: 'Invalid mitigation ID format' });
      }

      // Check mitigation access (support both standalone and project-linked JTSAs)
      const { data: mitigation } = await supabase
        .from('mitigations')
        .select('hazard:hazards(jtsa:jtsas(company_id))')
        .eq('id', req.params.id)
        .single();

      if (!mitigation || !mitigation.hazard || !mitigation.hazard.jtsa || mitigation.hazard.jtsa.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { data: updated, error } = await supabase
        .from('mitigations')
        .update({
          user_accepted: req.validatedBody.userAccepted,
          accepted_at: req.validatedBody.userAccepted ? new Date() : null,
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

// GET /api/mitigations/:id - get mitigation details
router.get('/mitigations/:id',
  authenticateToken,
  async (req, res, next) => {
    try {
      const supabase = req.app.locals.supabase;

      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ error: 'Invalid mitigation ID format' });
      }

      const { data: mitigation, error } = await supabase
        .from('mitigations')
        .select(`
          *,
          hazard:hazards(*, jtsa:jtsas(company_id))
        `)
        .eq('id', req.params.id)
        .single();

      if (!mitigation || !mitigation.hazard || !mitigation.hazard.jtsa || mitigation.hazard.jtsa.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(mitigation);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
