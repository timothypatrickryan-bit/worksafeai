const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { verifyCompanyAccess } = require('../middleware/companyAccess');
const { validateBody } = require('../middleware/validation');
const { createJTSASchema, updateJTSASchema, addParticipantSchema } = require('../validation/schemas');
const aiService = require('../ai/anthropicService');

// POST /api/companies/:cid/jtsas - create standalone JTSA (no project required)
router.post('/companies/:cid/jtsas',
  authenticateToken,
  verifyCompanyAccess,
  validateBody(createJTSASchema),
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;
      const companyId = req.params.cid;

      // Parse and validate date (strict YYYY-MM-DD format only)
      let date;
      if (req.validatedBody.date) {
        // Validate strict YYYY-MM-DD format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(req.validatedBody.date)) {
          return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }
        
        const parsedDate = new Date(req.validatedBody.date + 'T00:00:00Z');
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ error: 'Invalid date' });
        }
        
        // Strict UTC comparison: date cannot be in the future (relative to UTC today)
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        if (parsedDate > today) {
          return res.status(400).json({ error: 'Date cannot be in the future' });
        }
        
        date = req.validatedBody.date; // Use the validated string directly
      } else {
        // Use UTC date
        const now = new Date();
        date = now.toISOString().split('T')[0];
      }

      // Create JTSA (standalone, no project required)
      const { data: jtsa, error: createError } = await supabase
        .from('jtsas')
        .insert({
          company_id: companyId,
          project_number: req.validatedBody.projectNumber,
          location: req.validatedBody.location,
          type_of_work: req.validatedBody.typeOfWork,
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

        const { error: hazardError } = await supabase
          .from('hazards')
          .insert(hazardRecords);

        if (hazardError) throw hazardError;
      }

      // Audit log
      await supabase
        .from('audit_logs')
        .insert({
          company_id: companyId,
          user_id: req.user.id,
          action: 'create_jtsa',
          resource_type: 'jtsa',
          resource_id: jtsa.id,
          details: {
            project_number: req.validatedBody.projectNumber,
            location: req.validatedBody.location,
            type_of_work: req.validatedBody.typeOfWork,
          },
        });

      res.status(201).json({
        id: jtsa.id,
        projectNumber: jtsa.project_number,
        location: jtsa.location,
        typeOfWork: jtsa.type_of_work,
        taskDescription: jtsa.task_description,
        date: jtsa.date,
        status: jtsa.status,
        hazards: hazards.map(h => ({
          description: h.description,
          severity: h.severity || 'medium',
        })),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/companies/:cid/jtsas - list all JTSAs for company
router.get('/companies/:cid/jtsas',
  authenticateToken,
  verifyCompanyAccess,
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;
      
      // Validate and sanitize pagination parameters
      let limit = 50;
      let offset = 0;
      
      if (req.query.limit) {
        const parsedLimit = parseInt(req.query.limit, 10);
        if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 500) {
          return res.status(400).json({ error: 'Limit must be an integer between 1 and 500' });
        }
        limit = parsedLimit;
      }
      
      if (req.query.offset) {
        const parsedOffset = parseInt(req.query.offset, 10);
        if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
          return res.status(400).json({ error: 'Offset must be a non-negative integer' });
        }
        offset = parsedOffset;
      }
      
      const { status, location, typeOfWork, date } = req.query;

      let query = supabase
        .from('jtsas')
        .select(`
          id,
          project_number,
          location,
          type_of_work,
          date,
          task_description,
          status,
          created_by,
          pdf_url,
          created_at,
          updated_at,
          created_by_user:users!created_by(full_name, email)
        `)
        .eq('company_id', req.params.cid);

      // Apply optional filters
      if (status && ['in_progress', 'completed', 'archived'].includes(status)) {
        query = query.eq('status', status);
      }
      if (location) query = query.eq('location', location);
      if (typeOfWork) query = query.eq('type_of_work', typeOfWork);
      if (date) query = query.eq('date', date);

      const { data: jtsas, error } = await query
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      res.json({
        data: jtsas,
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

// GET /api/jtsas/:id - get JTSA details with all relationships
router.get('/jtsas/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;

      // Validate UUID format to prevent injection / unnecessary DB calls
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ error: 'Invalid JTSA ID format' });
      }

      const { data: jtsa, error } = await supabase
        .from('jtsas')
        .select('*')
        .eq('id', req.params.id)
        .single();

      // Check error / existence BEFORE using the data
      if (error) throw error;

      if (!jtsa) {
        return res.status(404).json({ error: 'JTSA not found' });
      }

      // Check company access before fetching related data
      if (jtsa.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Fetch related data in parallel for efficiency
      const [{ data: hazards }, { data: participants }] = await Promise.all([
        supabase.from('hazards').select('*').eq('jtsa_id', req.params.id),
        supabase.from('jtsa_participants').select('*').eq('jtsa_id', req.params.id),
      ]);

      // Combine data
      const jtsa_data = {
        ...jtsa,
        hazards: hazards || [],
        participants: participants || [],
      };

      res.json(jtsa_data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// PATCH /api/jtsas/:id - update JTSA
router.patch('/jtsas/:id',
  authenticateToken,
  validateBody(updateJTSASchema),
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ error: 'Invalid JTSA ID format' });
      }

      // Get JTSA to verify company access
      const { data: jtsa } = await supabase
        .from('jtsas')
        .select('company_id')
        .eq('id', req.params.id)
        .single();

      if (!jtsa) {
        return res.status(404).json({ error: 'JTSA not found' });
      }

      if (jtsa.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Update JTSA
      const updateData = {
        updated_at: new Date().toISOString(),
      };

      if (req.validatedBody.taskDescription) {
        updateData.task_description = req.validatedBody.taskDescription;
      }

      if (req.validatedBody.status) {
        updateData.status = req.validatedBody.status;
      }

      const { data: updated, error } = await supabase
        .from('jtsas')
        .update(updateData)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;

      // Audit log
      await supabase
        .from('audit_logs')
        .insert({
          company_id: jtsa.company_id,
          user_id: req.user.id,
          action: 'update_jtsa',
          resource_type: 'jtsa',
          resource_id: req.params.id,
          details: updateData,
        });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/jtsas/:id/participants - add participant to JTSA
router.post('/jtsas/:id/participants',
  authenticateToken,
  validateBody(addParticipantSchema),
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ error: 'Invalid JTSA ID format' });
      }

      // Verify JTSA exists and user has company access
      const { data: jtsa } = await supabase
        .from('jtsas')
        .select('company_id')
        .eq('id', req.params.id)
        .single();

      if (!jtsa) {
        return res.status(404).json({ error: 'JTSA not found' });
      }

      if (jtsa.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Verify the participant being added belongs to the same company
      // (prevents adding arbitrary user IDs from other companies)
      const { data: participantUser } = await supabase
        .from('users')
        .select('id, company_id, is_active')
        .eq('id', req.validatedBody.userId)
        .single();

      if (!participantUser || participantUser.company_id !== req.user.companyId) {
        return res.status(400).json({ error: 'User not found or does not belong to this company' });
      }

      if (!participantUser.is_active) {
        return res.status(400).json({ error: 'Cannot add an inactive user as participant' });
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

      // Audit log
      await supabase
        .from('audit_logs')
        .insert({
          company_id: jtsa.company_id,
          user_id: req.user.id,
          action: 'add_jtsa_participant',
          resource_type: 'jtsa',
          resource_id: req.params.id,
          details: { added_user_id: req.validatedBody.userId },
        });

      res.status(201).json(participant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/jtsas/:id/complete - mark JTSA as completed
router.post('/jtsas/:id/complete',
  authenticateToken,
  async (req, res) => {
    try {
      const supabase = req.app.locals.supabase;

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(req.params.id)) {
        return res.status(400).json({ error: 'Invalid JTSA ID format' });
      }

      // Get JTSA
      const { data: jtsa } = await supabase
        .from('jtsas')
        .select('company_id, status')
        .eq('id', req.params.id)
        .single();

      if (!jtsa) {
        return res.status(404).json({ error: 'JTSA not found' });
      }

      if (jtsa.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Update status
      const { data: updated, error } = await supabase
        .from('jtsas')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;

      // Audit log
      await supabase
        .from('audit_logs')
        .insert({
          company_id: jtsa.company_id,
          user_id: req.user.id,
          action: 'complete_jtsa',
          resource_type: 'jtsa',
          resource_id: req.params.id,
        });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
