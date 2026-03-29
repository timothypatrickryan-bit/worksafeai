/**
 * Authentication utilities: JWT generation, password hashing
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { config } from './config.js';

const SALT_ROUNDS = 12;

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(userId: string, email: string): string {
  const payload = {
    userId,
    email,
  };

  return jwt.sign(payload, config.jwt.secret as string, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

/**
 * Generate refresh token (separate secret)
 */
export function generateRefreshToken(userId: string): string {
  const payload = {
    userId,
    type: 'refresh',
  };

  return jwt.sign(payload, config.jwt.refreshSecret as string, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { userId: string; type: string } | null {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret as string) as { userId: string; type: string };
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Generate secure random ID
 */
export function generateId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Generate secure random JWT secret (for init/setup)
 */
export function generateSecret(): string {
  return randomBytes(32).toString('hex');
}
