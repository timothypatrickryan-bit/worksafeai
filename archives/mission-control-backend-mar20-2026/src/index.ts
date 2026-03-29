/**
 * Mission Control Backend API
 * Production-ready Express server with JWT auth, rate limiting, and SQLite
 */

import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config.js';
import { logger } from './logger.js';
import { initDatabase, closeDatabase } from './database.js';
import {
  createRateLimiter,
  errorHandler,
  requestLogger,
  notFoundHandler,
} from './middleware.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import systemRoutes from './routes/system.js';

const app = express();

// Validation
try {
  validateConfig();
  logger.info('Configuration validated');
} catch (error) {
  logger.error('Configuration error', error instanceof Error ? error : new Error(String(error)));
  process.exit(1);
}

// Middleware: CORS
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    optionsSuccessStatus: 200,
  }),
);

// Middleware: Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware: Request logging
app.use(requestLogger);

// Middleware: Rate limiting
app.use(createRateLimiter());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', systemRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Initialize and start server
async function startServer(): Promise<void> {
  try {
    // Initialize database
    await initDatabase();
    logger.info('Database initialized successfully');

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`, {
        nodeEnv: config.nodeEnv,
        corsOrigin: config.cors.origin,
      });
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      server.close(async () => {
        await closeDatabase();
        logger.info('Database closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after 10 second timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server', error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
}

startServer();

export default app;
