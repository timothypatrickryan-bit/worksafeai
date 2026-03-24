#!/usr/bin/env node

/**
 * Autonomy Task Cleanup
 * 
 * Runs as part of autonomy heartbeat to:
 * 1. Remove tasks with status "error" older than 24h
 * 2. Archive duplicate queued tasks (same projectId + title)
 * 3. Mark stalled tasks (in-progress > 48h) as blocked
 * 4. Update mission control state with clean data
 * 
 * This keeps mission control healthy and prevents stale data from accumulating.
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(process.cwd(), '.mission-control-state.json');
const CLEANUP_LOG = path.join(process.cwd(), '.cleanup.log');

const HOUR = 3600000;  // ms
const DAY = HOUR * 24;

function log(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  console.log(logEntry);
  fs.appendFileSync(CLEANUP_LOG, logEntry);
}

function cleanup() {
  try {
    let state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    const now = new Date().getTime();
    
    let changes = {
      errorRemoved: 0,
      duplicateArchived: 0,
      stalledMarked: 0,
    };
    
    // 1. Remove error tasks older than 24h
    const beforeErrorCount = state.tasks.length;
    state.tasks = state.tasks.filter(task => {
      if (task.status === 'error') {
        const taskAge = now - new Date(task.createdAt).getTime();
        if (taskAge > DAY) {
          changes.errorRemoved++;
          return false;  // Remove it
        }
      }
      return true;
    });
    
    // 2. Archive duplicate queued tasks
    const seen = new Set();
    state.tasks = state.tasks.map(task => {
      const key = `${task.projectId}-${task.title}`;
      
      if (task.status === 'queued' && seen.has(key)) {
        changes.duplicateArchived++;
        return { ...task, status: 'archived' };
      }
      
      if (task.status === 'queued') {
        seen.add(key);
      }
      
      return task;
    });
    
    // 3. Mark tasks in-progress > 48h as blocked
    state.tasks = state.tasks.map(task => {
      if (task.status === 'in-progress') {
        const taskAge = now - new Date(task.updatedAt).getTime();
        if (taskAge > DAY * 2) {
          changes.stalledMarked++;
          return { ...task, status: 'blocked' };
        }
      }
      return task;
    });
    
    // Write updated state
    state.lastCleanup = new Date().toISOString();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    
    log(`✅ Task cleanup complete`);
    log(`   - Error tasks removed: ${changes.errorRemoved}`);
    log(`   - Duplicate tasks archived: ${changes.duplicateArchived}`);
    log(`   - Stalled tasks marked blocked: ${changes.stalledMarked}`);
    log(`   - Total tasks: ${state.tasks.length}`);
    
    return changes;
    
  } catch (err) {
    log(`❌ Cleanup failed: ${err.message}`);
    throw err;
  }
}

// Run cleanup
if (require.main === module) {
  cleanup();
}

module.exports = { cleanup };
