const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { verifyJTSAAccess } = require('../middleware/companyAccess');
const { validateBody } = require('../middleware/validation');
const { createJTSASchema, updateJTSASchema, addParticipantSchema } = require('../validation/schemas');
const { invalidateCompanyCache } = require('../middleware/cache');
const aiService = require('../ai/openaiService');

// POST /api/projects/:pid/jtsa - create JTSA for a project
router.post('/projects/:pid/jtsa',
  authenticateToken,
  verifyJTSAAccess,
  validateBody(createJTSASchema),
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;
      const date = req.validatedBody.date ? new Date(req.validatedBody.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      // Check if JTSA already exists for this date
      const { data: existing } = await supabase
        .from('jtsas')
        .select('id')
        .eq('project_id', req.params.pid)
        .eq('date', date)
        .single();

      if (existing) {
        return res.status(409).json({ error: 'JTSA already exists for this date' });
      }

      // Create JTSA
      const { data: jtsa, error: createError } = await supabase
        .from('jtsas')
        .insert({
          project_id: req.params.pid,
          date,
          task_description: req.validatedBody.taskDescription,
          status: 'in_progress',
          created_by: req.user.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add creator as participant
      await supabase
        .from('jtsa_participants')
        .insert({
          jtsa_id: jtsa.id,
          user_id: req.user.id,
          role_in_jtsa: 'creator',
        });

      // Generate hazards via AI
      const hazards = await aiService.generateHazards(req.validatedBody.taskDescription);

      // Store hazards
      if (hazards.length > 0) {
        const hazardRecords = hazards.map(h => ({
          jtsa_id: jtsa.id,
          description: h.description,
          severity: h.severity || 'medium',
          ai_suggested: true,
        }));

        await supabase
          .from('hazards')
          .insert(hazardRecords);
      }

      // Return JTSA with hazards
      const { data: jtasWithHazards } = await supabase
        .from('jtsas')
        .select('*, hazards(*)')
        .eq('id', jtsa.id)
        .single();

      // Invalidate dashboard cache (new JTSA affects stats)
      await invalidateCompanyCache(req.user.company_id);

      res.status(201).json(jtasWithHazards);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/projects/:pid/jtsa - get today's JTSA (or by date)
router.get('/projects/:pid/jtsa',
  authenticateToken,
  verifyJTSAAccess,
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;
      const date = req.query.date || new Date().toISOString().split('T')[0];

      const { data: jtsa, error } = await supabase
        .from('jtsas')
        .select('*, hazards(*, mitigations(*))')
        .eq('project_id', req.params.pid)
        .eq('date', date)
        .single();

      if (error && error.code === 'PGRST116') {
        return res.status(404).json({ error: 'No JTSA found for this date' });
      }

      if (error) throw error;
      res.json(jtsa);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/jtsa/:id - get JTSA details with all relationships
router.get('/jtsa/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;

      const { data: jtsa, error } = await supabase
        .from('jtsas')
        .select(`
          *,
          project:projects(id, name, company_id),
          hazards(*, mitigations(*)),
          participants:jtsa_participants(*, user:users(id, full_name, email))
        `)
        .eq('id', req.params.id)
        .single();

      if (error || !jtsa) {
        return res.status(404).json({ error: 'JTSA not found' });
      }

      // Verify access to this JTSA's company
      if (jtsa.project.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(jtsa);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// PATCH /api/jtsa/:id - update JTSA (task description or status)
router.patch('/jtsa/:id',
  authenticateToken,
  validateBody(updateJTSASchema),
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;

      // Check access
      const { data: jtsa } = await supabase
        .from('jtsas')
        .select('project:projects(company_id)')
        .eq('id', req.params.id)
        .single();

      if (!jtsa || jtsa.project.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { data: updated, error } = await supabase
        .from('jtsas')
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

// POST /api/jtsa/:id/participants - add user to JTSA
router.post('/jtsa/:id/participants',
  authenticateToken,
  validateBody(addParticipantSchema),
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

      // Add participant
      const { data: participant, error } = await supabase
        .from('jtsa_participants')
        .insert({
          jtsa_id: req.params.id,
          user_id: req.validatedBody.userId,
          role_in_jtsa: 'participant',
        })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(participant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/jtsa/:id/participants - list participants signed in
router.get('/jtsa/:id/participants',
  authenticateToken,
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;

      // Verify access to this JTSA
      const { data: jtsa } = await supabase
        .from('jtsas')
        .select('project:projects(company_id)')
        .eq('id', req.params.id)
        .single();

      if (!jtsa || jtsa.project.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { data: participants, error } = await supabase
        .from('jtsa_participants')
        .select('*, user:users(id, full_name, email)')
        .eq('jtsa_id', req.params.id)
        .order('signed_in_at', { ascending: false });

      if (error) throw error;
      res.json(participants);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/jtsa/:id/complete - mark JTSA complete, generate PDF, send emails
router.post('/jtsa/:id/complete',
  authenticateToken,
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;
      const pdfService = require('../services/pdfService');
      const emailService = require('../services/emailService');
      const auditService = require('../services/auditService');

      // Get full JTSA with all relationships
      const { data: jtsa, error: jtsaError } = await supabase
        .from('jtsas')
        .select(`
          *,
          project:projects(id, name, company_id),
          hazards(*),
          mitigations(*)
        `)
        .eq('id', req.params.id)
        .single();

      if (jtsaError || !jtsa) {
        return res.status(404).json({ error: 'JTSA not found' });
      }

      // Verify access
      if (jtsa.project.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get company info
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', jtsa.project.company_id)
        .single();

      // Get all participants for email list
      const { data: participants } = await supabase
        .from('jtsa_participants')
        .select('user:users(email, full_name)')
        .eq('jtsa_id', req.params.id);

      // Generate PDF
      const pdfPath = await pdfService.generateJTSAPdf(
        jtsa,
        company,
        jtsa.project,
        jtsa.hazards,
        jtsa.mitigations
      );

      // Update JTSA status to completed and store PDF URL
      const pdfUrl = `/pdfs/JTSA_${jtsa.id}_${jtsa.date}.pdf`;
      await supabase
        .from('jtsas')
        .update({
          status: 'completed',
          pdf_url: pdfUrl,
          updated_at: new Date(),
        })
        .eq('id', req.params.id);

      // Send emails asynchronously (don't block response)
      if (participants && participants.length > 0) {
        participants.forEach(p => {
          if (p.user?.email) {
            emailService.sendJTSACompletionEmail({
              recipientEmail: p.user.email,
              recipientName: p.user.full_name || 'Team Member',
              companyName: company.name,
              projectName: jtsa.project.name,
              jtsa_id: jtsa.id,
              pdfPath,
            }).catch(err => {
              console.error(`Failed to send email to ${p.user.email}:`, err.message);
            });
          }
        });
      }

      // Log audit event
      await auditService.logAction(supabase, {
        companyId: jtsa.project.company_id,
        userId: req.user.id,
        action: 'completed_jtsa',
        resourceType: 'jtsa',
        resourceId: jtsa.id,
        dataChanged: { status: 'completed', pdf_generated: true },
        ipAddress: auditService.getClientIp(req),
      });

      res.json({
        message: 'JTSA completed and PDF generated',
        jtsa_id: jtsa.id,
        pdf_url: pdfUrl,
        emails_sent: participants?.length || 0,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
