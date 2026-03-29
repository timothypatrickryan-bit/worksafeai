#!/usr/bin/env node

/**
 * Auto-Update Task Status - Updates mission control state from parsed signals
 * 
 * Takes parsed agent response signals and auto-updates .mission-control-state.json
 * 
 * Usage:
 *   node auto-update-task-status.js <taskId> <statusUpdate.json>
 */

const fs = require('fs');

const CONFIG = {
  STATE_FILE: process.env.HOME + '/.openclaw/workspace/.mission-control-state.json',
  LOG_DIR: process.env.HOME + '/.openclaw/workspace/execution-logs',
  UPDATE_LOG: process.env.HOME + '/.openclaw/workspace/.task-update.log'
};

// Logging
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  try {
    fs.appendFileSync(CONFIG.UPDATE_LOG, `[${timestamp}] ${message}\n`);
  } catch (e) {
    // Silent fail
  }
}

// Load state
function loadState() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG.STATE_FILE, 'utf8'));
  } catch (e) {
    log(`ERROR loading state: ${e.message}`);
    return null;
  }
}

// Save state
function saveState(state) {
  try {
    fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(state, null, 2));
    log(`✅ State saved`);
    return true;
  } catch (e) {
    log(`ERROR saving state: ${e.message}`);
    return false;
  }
}

// Log execution event
function logExecution(event) {
  const today = new Date().toISOString().split('T')[0];
  const logPath = `${CONFIG.LOG_DIR}/${today}.jsonl`;

  try {
    fs.appendFileSync(logPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      ...event
    }) + '\n');
    return true;
  } catch (e) {
    log(`ERROR writing execution log: ${e.message}`);
    return false;
  }
}

// Apply status update to task
function updateTaskStatus(state, taskId, statusUpdate) {
  const task = state.tasks.find(t => t.id === taskId);
  
  if (!task) {
    log(`ERROR: Task not found: ${taskId}`);
    return false;
  }

  const oldStatus = task.status;

  // Apply updates
  Object.assign(task, statusUpdate.updates);

  log(`✅ Task ${taskId} updated: ${oldStatus} → ${statusUpdate.status}`);

  // Log the transition
  logExecution({
    type: 'task-status-change',
    taskId,
    oldStatus,
    newStatus: statusUpdate.status,
    reason: 'Auto-update from agent response',
    signals: statusUpdate.signals
  });

  return true;
}

// Main
function main() {
  const taskId = process.argv[2];
  const updateJsonPath = process.argv[3];

  if (!taskId || !updateJsonPath) {
    console.error('Usage: node auto-update-task-status.js <taskId> <statusUpdate.json>');
    console.error('Example: node auto-update-task-status.js task-1 update.json');
    process.exit(1);
  }

  // Load status update
  let statusUpdate;
  try {
    statusUpdate = JSON.parse(fs.readFileSync(updateJsonPath, 'utf8'));
  } catch (e) {
    log(`ERROR loading status update: ${e.message}`);
    process.exit(1);
  }

  // Load state
  const state = loadState();
  if (!state) {
    process.exit(1);
  }

  // Apply update
  if (!updateTaskStatus(state, taskId, statusUpdate)) {
    process.exit(1);
  }

  // Save updated state
  if (!saveState(state)) {
    process.exit(1);
  }

  console.log('\n=== UPDATE APPLIED ===');
  const updatedTask = state.tasks.find(t => t.id === taskId);
  console.log(JSON.stringify(updatedTask, null, 2));

  process.exit(0);
}

main();
