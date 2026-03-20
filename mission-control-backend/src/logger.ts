/**
 * Simple structured logging utility
 */

import { config } from './config.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  error?: string;
}

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = LOG_LEVELS[config.logLevel as LogLevel] ?? LOG_LEVELS.info;

function formatTimestamp(): string {
  return new Date().toISOString();
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= currentLevel;
}

function formatLog(entry: LogEntry): string {
  const baseLog = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;

  if (entry.data) {
    return `${baseLog}\n${JSON.stringify(entry.data, null, 2)}`;
  }

  if (entry.error) {
    return `${baseLog}\nError: ${entry.error}`;
  }

  return baseLog;
}

export const logger = {
  debug(message: string, data?: unknown): void {
    if (!shouldLog('debug')) return;
    const entry: LogEntry = {
      timestamp: formatTimestamp(),
      level: 'debug',
      message,
      data,
    };
    console.log(formatLog(entry));
  },

  info(message: string, data?: unknown): void {
    if (!shouldLog('info')) return;
    const entry: LogEntry = {
      timestamp: formatTimestamp(),
      level: 'info',
      message,
      data,
    };
    console.log(formatLog(entry));
  },

  warn(message: string, data?: unknown): void {
    if (!shouldLog('warn')) return;
    const entry: LogEntry = {
      timestamp: formatTimestamp(),
      level: 'warn',
      message,
      data,
    };
    console.warn(formatLog(entry));
  },

  error(message: string, error?: Error | string, data?: unknown): void {
    if (!shouldLog('error')) return;
    const errorMessage = error instanceof Error ? error.stack : String(error);
    const entry: LogEntry = {
      timestamp: formatTimestamp(),
      level: 'error',
      message,
      error: errorMessage,
      data,
    };
    console.error(formatLog(entry));
  },
};
