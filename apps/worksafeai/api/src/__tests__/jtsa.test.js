/**
 * JTSA Integration Tests
 * Tests: create JTSA (with AI hazards), list, update, complete, participants
 */

// Set NODE_ENV to development BEFORE loading the app
process.env.NODE_ENV = 'development';

// Mock email service BEFORE loading any modules that use it
jest.mock('../services/emailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue({ messageId: 'test-verify-123' }),
  sendInviteEmail: jest.fn().mockResolvedValue({ messageId: 'test-invite-456' }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ messageId: 'test-reset-789' }),
  sendJTSACompletionEmail: jest.fn().mockResolvedValue({ messageId: 'test-jtsa-101' }),
  testConnection: jest.fn().mockResolvedValue(true),
}));

const request = require('supertest');
const app = require('../server');

describe('JTSA (Job Task Safety Analysis)', () => {
  let token, companyId, projectId, jtsaId;

  // Setup: Register, create company, create project
  beforeAll(async () => {
    // Register with unique email
    const uniqueEmail = `jtsa-${Date.now()}@testcompany.com`;
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: uniqueEmail,
        password: 'SecurePass123!',
        fullName: 'JTSA Manager',
        companyName: 'JTSA Test Corp',
        industry: 'General Contracting',
      });

    if (registerRes.status !== 200 && registerRes.status !== 201) {
      console.error('Registration failed:', registerRes.status, registerRes.body);
      throw new Error(`Registration failed: ${JSON.stringify(registerRes.body)}`);
    }

    // In development, tokens are returned immediately
    token = registerRes.body.accessToken;
    companyId = registerRes.body.user.companyId;

    // Create project
    const projectRes = await request(app)
      .post(`/api/companies/${companyId}/projects`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Safety Project',
        description: 'Test project for JTSA',
      });

    projectId = projectRes.body.id;
  });

  describe('POST /api/projects/:pid/jtsa', () => {
    it('should create JTSA and auto-generate AI hazards', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/jtsa`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          taskDescription: 'Install electrical wiring in warehouse with height work up to 15 feet',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('project_id');
      expect(res.body).toHaveProperty('task_description');
      expect(res.body.status).toBe('in_progress');
      expect(res.body).toHaveProperty('hazards');

      // Should have AI-generated hazards
      if (res.body.hazards && res.body.hazards.length > 0) {
        expect(res.body.hazards[0]).toHaveProperty('description');
        expect(res.body.hazards[0]).toHaveProperty('severity');
        expect(res.body.hazards[0].ai_suggested).toBe(true);
      }

      jtsaId = res.body.id;
    });

    it('should reject duplicate JTSA for same date', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/jtsa`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          taskDescription: 'Another task on same day',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.error).toContain('already exists');
    });

    it('should require authenticated user', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/jtsa`)
        .send({
          taskDescription: 'Task description',
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/projects/:pid/jtsa', () => {
    it('should get today\'s JTSA', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/jtsa`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('in_progress');
    });

    it('should get JTSA by date parameter', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .get(`/api/projects/${projectId}/jtsa?date=${today}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /api/jtsa/:id', () => {
    it('should return full JTSA details with relationships', async () => {
      const res = await request(app)
        .get(`/api/jtsa/${jtsaId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(jtsaId);
      expect(res.body).toHaveProperty('hazards');
      expect(res.body).toHaveProperty('participants');
    });
  });

  describe('PATCH /api/jtsa/:id', () => {
    it('should update JTSA task description', async () => {
      const res = await request(app)
        .patch(`/api/jtsa/${jtsaId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          taskDescription: 'Updated task description',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.task_description).toBe('Updated task description');
    });

    it('should change JTSA status', async () => {
      const res = await request(app)
        .patch(`/api/jtsa/${jtsaId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'completed',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('completed');
    });
  });

  describe('Hazards & Mitigations', () => {
    it('should list hazards for JTSA', async () => {
      const res = await request(app)
        .get(`/api/jtsa/${jtsaId}/hazards`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('description');
        expect(res.body[0]).toHaveProperty('severity');
      }
    });

    it('should acknowledge hazard', async () => {
      // Get first hazard
      const hazardsRes = await request(app)
        .get(`/api/jtsa/${jtsaId}/hazards`)
        .set('Authorization', `Bearer ${token}`);

      if (hazardsRes.body.length > 0) {
        const hazardId = hazardsRes.body[0].id;

        const res = await request(app)
          .patch(`/api/hazards/${hazardId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            userAcknowledged: true,
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.user_acknowledged).toBe(true);
      }
    });
  });

  describe('Participants', () => {
    it('should add user as participant', async () => {
      // Creator should already be participant
      const res = await request(app)
        .get(`/api/jtsa/${jtsaId}/participants`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});
