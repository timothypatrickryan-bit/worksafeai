/**
 * Auth Integration Tests
 * Tests: register, login, token refresh, logout
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

describe('Authentication Flow', () => {
  let accessToken, refreshToken, userId, companyId;
  const uniqueEmail = `owner-${Date.now()}@testcompany.com`;
  const duplicateEmail = `duplicate-${Date.now()}@testcompany.com`;
  const weakEmail = `weak-${Date.now()}@testcompany.com`;

  describe('POST /api/auth/register', () => {
    it('should register new owner account with 3-day trial', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: uniqueEmail,
          password: 'SecurePass123!',
          fullName: 'Test Owner',
          companyName: 'Test Company',
          industry: 'General Contracting',
        });

      // In development, returns 200 with tokens immediately
      // In production, returns 201 and requires email verification
      const isDev = process.env.NODE_ENV === 'development';
      expect(res.statusCode).toBe(isDev ? 200 : 201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.role).toBe('owner');
      expect(res.body.user.email).toBe(uniqueEmail);

      // Store for later tests
      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
      userId = res.body.user.id;
      companyId = res.body.user.companyId;
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: uniqueEmail,
          password: 'SecurePass123!',
          fullName: 'Duplicate Owner',
          companyName: 'Another Company',
          industry: 'General Contracting',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: weakEmail,
          password: '123', // Too weak
          fullName: 'Test User',
          companyName: 'Test Company',
          industry: 'General Contracting',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'not-an-email',
          password: 'SecurePass123!',
          fullName: 'Test User',
          companyName: 'Test Company',
          industry: 'General Contracting',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct email/password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: uniqueEmail,
          password: 'SecurePass123!',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.email).toBe(uniqueEmail);

      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: uniqueEmail,
          password: 'WrongPassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: `nonexistent-${Date.now()}@testcompany.com`,
          password: 'SecurePass123!',
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return logged-in user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe(uniqueEmail);
      expect(res.body.user.role).toBe('owner');
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should return new access token with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.accessToken).not.toBe(accessToken); // Should be different

      accessToken = res.body.accessToken;
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid_refresh_token' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully (client-side operation)', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
    });
  });
});
