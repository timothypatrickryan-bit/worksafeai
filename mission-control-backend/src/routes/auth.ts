/**
 * Authentication routes: register, login, refresh
 */

import { Router, Request, Response } from 'express';
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateId,
} from '../auth.js';
import { validateRequest, RegisterSchema, LoginSchema, RefreshTokenSchema, RegisterPayload, LoginPayload, RefreshTokenPayload } from '../validation.js';
import { createUser, getUserByEmail, updateLastLogin } from '../database.js';
import { logger } from '../logger.js';
import { ApiResponse, AuthResponse } from '../types.js';

const router = Router();

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validateRequest<RegisterPayload>(RegisterSchema, req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: validation.error,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
      return;
    }

    const { email, password } = validation.data!;

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'User already exists',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
      return;
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const userId = generateId();
    const now = new Date().toISOString();

    await createUser({
      id: userId,
      email,
      password_hash: passwordHash,
      created_at: now,
      last_login: null,
    });

    // Generate tokens
    const token = generateToken(userId, email);
    const refreshToken = generateRefreshToken(userId);

    logger.info('User registered', { email, userId });

    res.status(201).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: { id: userId, email },
      } as AuthResponse,
      timestamp: new Date().toISOString(),
    } as ApiResponse<AuthResponse>);
  } catch (error) {
    logger.error('Registration error', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

/**
 * POST /api/auth/login
 * Login user and return JWT
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validateRequest<LoginPayload>(LoginSchema, req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: validation.error,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
      return;
    }

    const { email, password } = validation.data!;

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
      return;
    }

    // Verify password
    const passwordValid = await comparePassword(password, user.password_hash);
    if (!passwordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
      return;
    }

    // Update last login
    await updateLastLogin(user.id);

    // Generate tokens
    const token = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    logger.info('User logged in', { email, userId: user.id });

    res.status(200).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: { id: user.id, email: user.email },
      } as AuthResponse,
      timestamp: new Date().toISOString(),
    } as ApiResponse<AuthResponse>);
  } catch (error) {
    logger.error('Login error', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({
      success: false,
      error: 'Login failed',
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validateRequest<RefreshTokenPayload>(RefreshTokenSchema, req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: validation.error,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
      return;
    }

    const { refreshToken } = validation.data!;
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>);
      return;
    }

    // Note: In production, also verify user still exists
    // For now, we'll generate a new token from the decoded data
    const token = generateToken(decoded.userId, ''); // Email would need to be fetched from DB

    res.status(200).json({
      success: true,
      data: {
        token,
        refreshToken, // Return same refresh token if still valid
        user: { id: decoded.userId, email: '' },
      } as AuthResponse,
      timestamp: new Date().toISOString(),
    } as ApiResponse<AuthResponse>);
  } catch (error) {
    logger.error('Token refresh error', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({
      success: false,
      error: 'Token refresh failed',
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
});

export default router;
