#!/usr/bin/env node

/**
 * Execution Tracker - Real-time task execution monitoring
 * 
 * Tracks agent task execution and auto-updates mission control state
 * - Monitors for task completion signals
 * - Updates .mission-control-state.json with status changes
 * - Creates execution-logs/YYYY-MM-DD.jsonl for audit trail
 * - Identifies blocked tasks (no progress > 4h)
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  WORKSPACE: process.env.HOME + '/.openclaw/workspace',
  STATE_FILE: process.env.HOME + '/.openclaw/workspace/.mission-control-state.json',
  LOG_DIR: process.env.HOME + '/.openclaw/workspace/execution-logs',
  TRACKER_LOG: process.env.HOME + '/.openclaw/workspace/.execution-tracker.log',
  STALE_THRESHOLD_HOURS: 4
};

// Logging
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}`;
  console.log(logEntry);
  try {
    fs.appendFileSync(CONFIG.TRACKER_LOG, logEntry + '\n');
  } catch (e) {
    // Silent fail
  }
}

// Load mission control state
function loadState() {
  try {
    const data = fs.readFileSync(CONFIG.STATE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    log(`ERROR loading state: ${e.message}`, 'ERROR');
    return { tasks: [], agents: [] };
  }
}

// Save mission control state
function saveState(state) {
  try {
    fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(state, null, 2));
    log(`✅ State saved (${state.tasks.length} tasks)`);
    return true;
  } catch (e) {
    log(`ERROR saving state: ${e.message}`, 'ERROR');
    return false;
  }
}

// Get today's execution log file
function getExecutionLogPath() {
  const today = new Date().toISOString().split('T')[0];
  return path.join(CONFIG.LOG_DIR, `${today}.jsonl`);
}

// Write execution event
function logExecution(event) {
  const logPath = getExecutionLogPath();
  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    ...event
  };
  
  try {
    fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
    return true;
  } catch (e) {
    log(`ERROR writing execution log: ${e.message}`, 'ERROR');
    return false;
  }
}

// Check for completion signals from agent sessions
function checkAgentCompletion(task, state) {
  // Check if task has recent execution timestamp
  if (!task.lastExecutionAt) {
    return null;
  }

  const lastExecution = new Date(task.lastExecutionAt);
  const now = new Date();
  const hoursSinceExecution = (now - lastExecution) / (1000 * 60 * 60);

  // Heuristics for completion:
  // 1. Task has executionComplete flag
  if (task.executionComplete) {
    return 'complete';
  }

  // 2. Task has a deliverable saved
  if (task.deliverablePath && fs.existsSync(path.join(CONFIG.WORKSPACE, task.deliverablePath))) {
    return 'complete';
  }

  // 3. Task status changed to 'executing' but no progress in 4+ hours
  if (task.status === 'executing' && hoursSinceExecution > CONFIG.STALE_THRESHOLD_HOURS) {
    return 'blocked';
  }

  // 4. Task duration exceeded estimated hours by 2x
  if (task.estimatedHours && hoursSinceExecution > task.estimatedHours * 2) {
    return 'blocked';
  }

  return null;
}

// Update task status based on detection
function updateTaskStatus(state, taskId, newStatus, reason) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return false;

  const oldStatus = task.status;
  task.status = newStatus;
  task.statusReason = reason;
  task.statusUpdatedAt = new Date().toISOString();

  // Log the transition
  logExecution({
    type: 'task-status-change',
    taskId,
    oldStatus,
    newStatus,
    reason,
    assignedAgent: task.assignedAgent
  });

  log(`📋 Task ${taskId}: ${oldStatus} → ${newStatus} (${reason})`);
  return true;
}

// Detect blocked tasks (stale execution)
function detectBlockedTasks(state) {
  const blocked = [];
  const now = new Date();

  state.tasks.forEach(task => {
    if (task.status === 'executing' && task.lastExecutionAt) {
      const lastExec = new Date(task.lastExecutionAt);
      const hoursSince = (now - lastExec) / (1000 * 60 * 60);

      if (hoursSince > CONFIG.STALE_THRESHOLD_HOURS) {
        blocked.push({
          taskId: task.id,
          title: task.title,
          agent: task.assignedAgent,
          hoursSinceLastUpdate: hoursSince.toFixed(1),
          startedAt: task.executionStartedAt,
          estimatedHours: task.estimatedHours
        });

        updateTaskStatus(state, task.id, 'blocked', `No progress for ${hoursSince.toFixed(1)} hours`);
      }
    }
  });

  return blocked;
}

// Detect recently completed tasks
function detectCompletedTasks(state) {
  const completed = [];

  state.tasks.forEach(task => {
    const signal = checkAgentCompletion(task, state);

    if (signal === 'complete' && task.status !== 'complete') {
      completed.push({
        taskId: task.id,
        title: task.title,
        agent: task.assignedAgent,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualExecutionHours || 'unknown'
      });

      updateTaskStatus(state, task.id, 'complete', 'Deliverable detected or execution flag set');
    }
  });

  return completed;
}

// Generate execution summary
function generateSummary(state, blocked, completed) {
  const total = state.tasks.length;
  const executing = state.tasks.filter(t => t.status === 'executing').length;
  const idle = state.tasks.filter(t => t.status === 'assigned').length;
  const complete = state.tasks.filter(t => t.status === 'complete').length;

  return {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      idle,
      executing,
      blocked: blocked.length,
      complete
    },
    blockedTasks: blocked,
    completedTasks: completed,
    health: {
      allTasksProgressing: blocked.length === 0,
      completionRate: (complete / total * 100).toFixed(1) + '%',
      averageExecutionTime: calculateAverageTime(state)
    }
  };
}

// Calculate average execution time for completed tasks
function calculateAverageTime(state) {
  const completedWithTime = state.tasks
    .filter(t => t.status === 'complete' && t.actualExecutionHours)
    .map(t => t.actualExecutionHours);

  if (completedWithTime.length === 0) return 'N/A';

  const avg = completedWithTime.reduce((a, b) => a + b, 0) / completedWithTime.length;
  return avg.toFixed(1) + ' hours';
}

// Main execution tracking cycle
function trackExecution() {
  log('🔍 Starting execution tracking cycle...');

  // Load current state
  const state = loadState();
  log(`📊 Loaded state: ${state.tasks.length} tasks`);

  // Detect blocked tasks
  const blocked = detectBlockedTasks(state);
  if (blocked.length > 0) {
    log(`⚠️  BLOCKED TASKS DETECTED: ${blocked.length}`, 'WARN');
    blocked.forEach(b => {
      log(`  • ${b.taskId}: ${b.title} (${b.hoursSinceLastUpdate}h stale)`, 'WARN');
    });
  }

  // Detect completed tasks
  const completed = detectCompletedTasks(state);
  if (completed.length > 0) {
    log(`✅ COMPLETED TASKS DETECTED: ${completed.length}`);
    completed.forEach(c => {
      log(`  • ${c.taskId}: ${c.title}`);
    });
  }

  // Generate summary
  const summary = generateSummary(state, blocked, completed);

  // Save updated state
  if (blocked.length > 0 || completed.length > 0) {
    saveState(state);
    logExecution({
      type: 'execution-cycle',
      summary
    });
  }

  // Output summary
  console.log('\n' + JSON.stringify(summary, null, 2));

  // Alert if critical issues
  if (blocked.length > 2) {
    log(`🚨 CRITICAL: ${blocked.length} tasks blocked`, 'ERROR');
    return 1;
  }

  if (!summary.health.allTasksProgressing) {
    log(`⚠️  ${blocked.length} tasks require attention`, 'WARN');
    return 0;
  }

  log('✨ Execution tracking complete. All tasks progressing.');
  return 0;
}

// Run
const exitCode = trackExecution();
process.exit(exitCode);
