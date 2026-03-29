import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  databasePath: process.env.DATABASE_PATH || path.join(__dirname, '../data/mission.db'),

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate critical config on startup
export function validateConfig(): void {
  const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];

  if (config.isProduction) {
    const missing = required.filter((key) => !process.env[key] || process.env[key] === `dev-${key.toLowerCase()}`);
    if (missing.length > 0) {
      throw new Error(
        `Missing or invalid production configuration: ${missing.join(', ')}. Please set environment variables.`,
      );
    }
  }
}
