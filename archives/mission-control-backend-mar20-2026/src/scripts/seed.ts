/**
 * Seed script: Initialize database with mock data for development/testing
 */

import { initDatabase, createTask, createUser } from '../database.js';
import { hashPassword, generateId } from '../auth.js';
import { logger } from '../logger.js';
import { Task, User } from '../types.js';

async function seed(): Promise<void> {
  try {
    logger.info('Starting database seed...');

    // Initialize schema
    await initDatabase();
    logger.info('Database schema created');

    // Seed users
    const users: User[] = [
      {
        id: generateId(),
        email: 'tim@elevationaiwork.com',
        password_hash: await hashPassword('SecurePassword123'),
        created_at: new Date().toISOString(),
        last_login: null,
      },
      {
        id: generateId(),
        email: 'test@example.com',
        password_hash: await hashPassword('TestPassword123'),
        created_at: new Date().toISOString(),
        last_login: null,
      },
    ];

    for (const user of users) {
      try {
        await createUser(user);
        logger.info(`User created: ${user.email}`);
      } catch (error) {
        logger.warn(`User already exists: ${user.email}`);
      }
    }

    // Seed tasks
    const now = new Date();
    const tasks: Task[] = [
      {
        id: generateId(),
        title: 'Deploy WorkSafeAI',
        description: 'Deploy the latest version of WorkSafeAI to production',
        status: 'completed',
        priority: 'high',
        project: 'WorkSafeAI',
        created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        started_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        output: 'Deployed successfully to production. All health checks passed.',
      },
      {
        id: generateId(),
        title: 'Analyze safety reports',
        description: 'Process and analyze Q1 safety incident reports',
        status: 'executing',
        priority: 'high',
        project: 'Safety Analysis',
        created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        started_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: null,
        output: null,
      },
      {
        id: generateId(),
        title: 'Update safety protocols',
        description: 'Review and update safety protocols based on latest guidelines',
        status: 'pending',
        priority: 'medium',
        project: 'Safety Management',
        created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        started_at: null,
        completed_at: null,
        output: null,
      },
      {
        id: generateId(),
        title: 'Database optimization',
        description: 'Optimize database queries for better performance',
        status: 'pending',
        priority: 'medium',
        project: 'Infrastructure',
        created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        started_at: null,
        completed_at: null,
        output: null,
      },
      {
        id: generateId(),
        title: 'API documentation',
        description: 'Complete API documentation for all endpoints',
        status: 'pending',
        priority: 'low',
        project: 'Documentation',
        created_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        started_at: null,
        completed_at: null,
        output: null,
      },
      {
        id: generateId(),
        title: 'Incident response system',
        description: 'Implement automated incident response system',
        status: 'failed',
        priority: 'critical',
        project: 'Crisis Management',
        created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        started_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        output: 'Failed due to integration issues with third-party API. Will retry next sprint.',
      },
    ];

    for (const task of tasks) {
      try {
        await createTask(task);
        logger.info(`Task created: ${task.title} (${task.status})`);
      } catch (error) {
        logger.warn(`Task already exists: ${task.title}`);
      }
    }

    logger.info('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed', error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
}

seed();
