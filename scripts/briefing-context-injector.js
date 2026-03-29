#!/usr/bin/env node

/**
 * Briefing Context Injector - Adds execution context to agent briefings
 * 
 * Injects prior task status + execution history into briefing payloads
 * Enables agents to provide completion signals in their responses
 * 
 * Usage:
 *   node briefing-context-injector.js <taskId>
 *   
 *   Returns enriched briefing context ready to send to agent
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  WORKSPACE: process.env.HOME + '/.openclaw/workspace',
  STATE_FILE: process.env.HOME + '/.openclaw/workspace/.mission-control-state.json',
  LOG_DIR: process.env.HOME + '/.openclaw/workspace/execution-logs',
  BRIEFING_DIR: process.env.HOME + '/.openclaw/workspace/projects/briefings'
};

// Load mission control state
function loadState() {
  try {
    const data = fs.readFileSync(CONFIG.STATE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error(`ERROR loading state: ${e.message}`);
    return { tasks: [], agents: [] };
  }
}

// Get task execution history
function getTaskHistory(taskId) {
  const today = new Date().toISOString().split('T')[0];
  const logPath = path.join(CONFIG.LOG_DIR, `${today}.jsonl`);

  const history = [];

  try {
    if (fs.existsSync(logPath)) {
      const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(l => l.trim());
      lines.forEach(line => {
        try {
          const entry = JSON.parse(line);
          if (entry.taskId === taskId || entry.type === 'execution-cycle') {
            history.push(entry);
          }
        } catch (e) {
          // Silently skip malformed lines
        }
      });
    }
  } catch (e) {
    console.error(`Warning: Could not read execution history: ${e.message}`);
  }

  return history;
}

// Build execution context for briefing
function buildExecutionContext(task, history) {
  return {
    taskId: task.id,
    title: task.title,
    currentStatus: task.status,
    assignedAgent: task.assignedAgent,
    priority: task.priority,
    complexity: task.complexity,
    estimatedHours: task.estimatedHours,
    autoRoutedAt: task.autoRoutedAt,
    routingReason: task.routingReason,
    
    // Execution tracking context
    executionHistory: history.filter(h => h.type !== 'execution-cycle'),
    previousAttempts: task.previousAttempts || 0,
    blockedReason: task.statusReason,
    blockedSince: task.statusUpdatedAt,
    
    // Instructions for agent response
    completionSignals: {
      "Provide a completion message": "If task is complete, include: '[TASK_COMPLETE] [brief summary]'",
      "Provide a status update": "If still executing, include: '[EXECUTION_UPDATE] [current progress]'",
      "Provide a blocker message": "If blocked, include: '[TASK_BLOCKED] [reason and required help]'",
      "Include deliverable path": "If creating files, include: '[DELIVERABLE] /path/to/output'"
    }
  };
}

// Inject context into briefing
function injectContextIntoBriefing(taskId) {
  const state = loadState();
  const task = state.tasks.find(t => t.id === taskId);

  if (!task) {
    console.error(`Task not found: ${taskId}`);
    return null;
  }

  const history = getTaskHistory(taskId);
  const context = buildExecutionContext(task, history);

  // Build briefing preamble
  const preamble = `
=== EXECUTION CONTEXT ===
Task: ${context.title}
Status: ${context.currentStatus}
Agent: ${context.assignedAgent}
Priority: ${context.priority}/5 | Complexity: ${context.complexity}/10
Estimated: ${context.estimatedHours}h

PREVIOUS ATTEMPTS: ${context.previousAttempts}
${context.blockedReason ? `BLOCKED REASON: ${context.blockedReason}` : ''}

COMPLETION SIGNALS (include in your response):
${Object.entries(context.completionSignals)
  .map(([k, v]) => `• ${k}\n  "${v}"`)
  .join('\n')}

=== PRIOR EXECUTION ===
${history.length > 0 
  ? history.slice(-5).map(h => `[${h.timestamp}] ${h.type}: ${JSON.stringify(h).substring(0, 100)}`).join('\n')
  : 'No prior execution events'}

===================================
`;

  return {
    briefingContext: preamble,
    task: context,
    executionHistory: history
  };
}

// Main
function main() {
  const taskId = process.argv[2];

  if (!taskId) {
    console.error('Usage: node briefing-context-injector.js <taskId>');
    process.exit(1);
  }

  const contextPayload = injectContextIntoBriefing(taskId);

  if (!contextPayload) {
    process.exit(1);
  }

  // Output enriched context
  console.log(contextPayload.briefingContext);
  console.log('\n--- STRUCTURED CONTEXT ---');
  console.log(JSON.stringify(contextPayload, null, 2));

  process.exit(0);
}

main();
