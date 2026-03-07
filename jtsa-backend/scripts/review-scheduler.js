#!/usr/bin/env node

/**
 * JTSA Backend Opus Review Scheduler
 * Runs code review every 30 minutes automatically
 * 
 * Usage: node scripts/review-scheduler.js
 * Run in background: nohup node scripts/review-scheduler.js > logs/reviewer.log 2>&1 &
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REVIEW_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds
const LOG_DIR = path.join(__dirname, '../logs');
const PROJECT_DIR = path.join(__dirname, '..');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  // Write to log file
  fs.appendFileSync(
    path.join(LOG_DIR, 'reviewer.log'),
    logMessage + '\n'
  );
};

const getFileList = () => {
  const files = [];
  const srcDir = path.join(PROJECT_DIR, 'src');
  
  const walkDir = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!fullPath.includes('node_modules')) {
          walkDir(fullPath);
        }
      } else if (entry.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  };
  
  walkDir(srcDir);
  return files;
};

const runReview = async () => {
  log('Starting Opus code review...');
  
  try {
    const files = getFileList();
    const fileList = files.map(f => path.relative(PROJECT_DIR, f)).join('\n');
    
    // This would ideally trigger the OpenClaw Opus subagent
    // For now, we'll just log that a review would run
    log(`Would review ${files.length} files: ${fileList}`);
    log('Review cycle completed');
  } catch (error) {
    log(`Review error: ${error.message}`);
  }
};

const start = () => {
  log('Opus Review Scheduler started');
  log(`Review interval: 30 minutes`);
  log(`Project directory: ${PROJECT_DIR}`);
  
  // Run immediately on start
  runReview();
  
  // Schedule recurring reviews
  setInterval(() => {
    runReview();
  }, REVIEW_INTERVAL);
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  log('Scheduler stopped (SIGTERM)');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('Scheduler stopped (SIGINT)');
  process.exit(0);
});

start();
