/**
 * SQLite database initialization and management
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { config } from './config.js';
import { logger } from './logger.js';
import { User, Task } from './types.js';

let db: sqlite3.Database;

// Helper to work with promises
function getDatabase(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const dbPath = config.databasePath;
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('Failed to open database', err);
        reject(err);
      } else {
        logger.info('Database connected', { path: dbPath });
        resolve(db);
      }
    });
  });
}

export async function initDatabase(): Promise<void> {
  const database = await getDatabase();

  const run = promisify(database.run.bind(database));

  // Create users table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_login TEXT
    )
  `);

  // Create tasks table
  await run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      priority TEXT NOT NULL DEFAULT 'medium',
      project TEXT NOT NULL,
      created_at TEXT NOT NULL,
      started_at TEXT,
      completed_at TEXT,
      output TEXT
    )
  `);

  logger.info('Database schema initialized');
}

export function run(sql: string, params: unknown[] = []): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const database = await getDatabase();
    database.run(sql, params, function (err) {
      if (err) {
        logger.error('Database run error', err, { sql });
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return new Promise(async (resolve, reject) => {
    const database = await getDatabase();
    database.get(sql, params, (err, row) => {
      if (err) {
        logger.error('Database get error', err, { sql });
        reject(err);
      } else {
        resolve(row as T | undefined);
      }
    });
  });
}

export function all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    const database = await getDatabase();
    database.all(sql, params, (err, rows) => {
      if (err) {
        logger.error('Database all error', err, { sql });
        reject(err);
      } else {
        resolve((rows || []) as T[]);
      }
    });
  });
}

export async function closeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve();
      return;
    }
    db.close((err) => {
      if (err) {
        logger.error('Database close error', err);
        reject(err);
      } else {
        logger.info('Database closed');
        resolve();
      }
    });
  });
}

// User operations
export async function createUser(user: User): Promise<void> {
  await run(
    `INSERT INTO users (id, email, password_hash, created_at, last_login) 
     VALUES (?, ?, ?, ?, ?)`,
    [user.id, user.email, user.password_hash, user.created_at, user.last_login],
  );
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return get<User>(`SELECT * FROM users WHERE email = ?`, [email]);
}

export async function getUserById(id: string): Promise<User | undefined> {
  return get<User>(`SELECT * FROM users WHERE id = ?`, [id]);
}

export async function updateLastLogin(userId: string): Promise<void> {
  await run(`UPDATE users SET last_login = ? WHERE id = ?`, [new Date().toISOString(), userId]);
}

// Task operations
export async function createTask(task: Task): Promise<void> {
  await run(
    `INSERT INTO tasks (id, title, description, status, priority, project, created_at, started_at, completed_at, output)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.id,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.project,
      task.created_at,
      task.started_at,
      task.completed_at,
      task.output,
    ],
  );
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  return get<Task>(`SELECT * FROM tasks WHERE id = ?`, [id]);
}

export async function getAllTasks(): Promise<Task[]> {
  return all<Task>(`SELECT * FROM tasks ORDER BY created_at DESC`);
}

export async function getTasksByStatus(status: string): Promise<Task[]> {
  return all<Task>(`SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC`, [status]);
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) return;

  values.push(id);
  const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
  await run(sql, values);
}

export async function getTaskStats(): Promise<{
  total: number;
  executing: number;
  completed: number;
}> {
  const tasks = await getAllTasks();
  return {
    total: tasks.length,
    executing: tasks.filter((t) => t.status === 'executing').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };
}
