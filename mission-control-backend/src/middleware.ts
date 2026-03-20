/**
 * Express middleware for authentication, error handling, and CORS
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { logger } from './logger.js';
import { JWTPayload, ApiResponse } from './types.js';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Rate limiter middleware
export const createRateLimiter = () =>
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health check
      return req.path === '/api/health';
    },
  });

// Authentication middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger.warn('Missing auth token', { path: req.path, ip: req.ip });
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret as string) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid token', { error: error instanceof Error ? error.message : String(error), ip: req.ip });
    res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>);
  }
};

// Error handling middleware
export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
  const errorObj = err instanceof Error ? err : new Error(String(err));
  logger.error('Request error', errorObj, { path: req.path, method: req.method, ip: req.ip });

  const statusCode = 500;
  const message = err instanceof Error ? err.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  } as ApiResponse<null>);
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  } as ApiResponse<null>);
};
