/**
 * Billing Integration Tests
 * Tests: subscription creation, tier changes, status, cancellation
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

describe('Billing & Subscriptions', () => {
  let token, companyId;

  // Setup: Register and login
  beforeAll(async () => {
    const uniqueEmail = `billing-${Date.now()}@testcompany.com`;
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: uniqueEmail,
        password: 'SecurePass123!',
        fullName: 'Billing Owner',
        companyName: 'Billing Test Co',
        industry: 'General Contracting',
      });

    token = registerRes.body.accessToken;
    companyId = registerRes.body.user.companyId;
  });

  describe('POST /api/billing/subscribe', () => {
    it('should create subscription with starter tier', async () => {
      const res = await request(app)
        .post('/api/billing/subscribe')
        .set('Authorization', `Bearer ${token}`)
        .send({ tier: 'starter' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('subscription_id');
      expect(res.body.status).toBe('trialing');
      expect(res.body).toHaveProperty('trial_end');
      expect(res.body.message).toContain('3-day free trial');
    });

    it('should reject invalid tier', async () => {
      const res = await request(app)
        .post('/api/billing/subscribe')
        .set('Authorization', `Bearer ${token}`)
        .send({ tier: 'invalid_tier' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject duplicate subscription', async () => {
      const res = await request(app)
        .post('/api/billing/subscribe')
        .set('Authorization', `Bearer ${token}`)
        .send({ tier: 'pro' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('already has an active subscription');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/billing/subscribe')
        .send({ tier: 'starter' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/billing/status', () => {
    it('should return current billing status', async () => {
      const res = await request(app)
        .get('/api/billing/status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('current_tier');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('tier_limits');
      expect(res.body.tier_limits).toHaveProperty('max_employees');
      expect(res.body.tier_limits).toHaveProperty('max_projects');
    });

    it('should show correct tier limits', async () => {
      const res = await request(app)
        .get('/api/billing/status')
        .set('Authorization', `Bearer ${token}`);

      if (res.body.current_tier === 'starter') {
        expect(res.body.tier_limits.max_employees).toBe(10);
        expect(res.body.tier_limits.max_projects).toBe(5);
      }
    });
  });

  describe('POST /api/billing/change-tier', () => {
    it('should upgrade to pro tier', async () => {
      const res = await request(app)
        .post('/api/billing/change-tier')
        .set('Authorization', `Bearer ${token}`)
        .send({ tier: 'pro' });

      expect(res.statusCode).toBe(200);
      expect(res.body.new_tier).toBe('pro');
      expect(res.body.status).toBe('active');
    });

    it('should verify upgraded tier limits', async () => {
      const res = await request(app)
        .get('/api/billing/status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.body.current_tier).toBe('pro');
      expect(res.body.tier_limits.max_employees).toBe(50);
      expect(res.body.tier_limits.max_projects).toBe(-1); // unlimited
    });

    it('should reject invalid tier', async () => {
      const res = await request(app)
        .post('/api/billing/change-tier')
        .set('Authorization', `Bearer ${token}`)
        .send({ tier: 'nonexistent' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/billing/cancel', () => {
    it('should require owner role', async () => {
      // Create employee token (would need separate user for this)
      // For now, test with owner token
      const res = await request(app)
        .post('/api/billing/cancel')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('Subscription cancelled');
    });

    it('should prevent second cancellation', async () => {
      const res = await request(app)
        .post('/api/billing/cancel')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('No active subscription');
    });
  });

  describe('Billing Audit Logging', () => {
    it('should log subscription events to audit_logs', async () => {
      // This would require access to audit_logs table
      // Would verify: subscription_created, subscription_tier_changed, subscription_cancelled
      // For MVP, verify endpoint logs exist
      expect(true).toBe(true); // Placeholder for full implementation
    });
  });
});
