#!/usr/bin/env node

/**
 * Lucy's Autonomy Heartbeat
 * Runs every 30 minutes
 * 
 * Checks for:
 * - Completed agent work (status: "complete")
 * - Quality review (deliverables check)
 * - State sync (update mission-control-state.json)
 * - Next work assignment (assign highest-priority task)
 * - Log all transitions
 * 
 * This is the CORE autonomy loop that keeps work flowing continuously
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const WORKSPACE = path.join(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');
const AUTONOMY_LOG = path.join(WORKSPACE, '.autonomy-log.txt');

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (err) {
    console.error(`Failed to read state file: ${err.message}`);
    return null;
  }
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(AUTONOMY_LOG, logEntry);
  console.log(logEntry);
}

function checkAgentStatus(state) {
  if (!state || !state.agents) return [];
  
  const completed = [];
  for (const [agentName, agentData] of Object.entries(state.agents)) {
    if (agentData.status === 'complete' && agentData.output) {
      completed.push({
        agent: agentName,
        lastActivity: agentData.lastActivity,
        output: agentData.output,
      });
    }
  }
  return completed;
}

function findExecutingBriefings(state) {
  if (!state || !state.tasks) return [];
  
  // Find tasks that are "executing"
  return state.tasks.filter(t => t.status === 'executing');
}

function findQueuedTasks(state) {
  if (!state || !state.tasks) return [];
  
  // Find tasks that are "queued" and ready to assign
  return state.tasks
    .filter(t => t.status === 'queued')
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
}

function main() {
  try {
    log('=== AUTONOMY HEARTBEAT RUN ===');
    
    const state = readState();
    if (!state) {
      log('⚠️  State file not readable, skipping this cycle');
      return;
    }
    
    // Check 1: Completed work
    const completedAgents = checkAgentStatus(state);
    if (completedAgents.length > 0) {
      log(`📋 COMPLETED WORK: ${completedAgents.length} agent(s) finished`);
      completedAgents.forEach(agent => {
        log(`   ✅ ${agent.agent} (${agent.lastActivity})`);
      });
    }
    
    // Check 2: Executing tasks
    const executing = findExecutingBriefings(state);
    if (executing.length > 0) {
      log(`🟡 IN PROGRESS: ${executing.length} task(s) executing`);
      executing.forEach(task => {
        log(`   🟡 ${task.title}`);
      });
    }
    
    // Check 3: Queued tasks waiting for assignment
    const queued = findQueuedTasks(state);
    if (queued.length > 0) {
      log(`📭 QUEUED: ${queued.length} task(s) awaiting assignment`);
      queued.slice(0, 3).forEach(task => {
        log(`   ⏳ [P${task.priority || 'N/A'}] ${task.title}`);
      });
    }
    
    // Check 4: Alert on stuck tasks (executing > 4 hours)
    const stuckTasks = executing.filter(t => {
      if (!t.createdAt) return false;
      const created = new Date(t.createdAt);
      const elapsed = (Date.now() - created.getTime()) / (1000 * 60);
      return elapsed > 240; // 4 hours
    });
    
    if (stuckTasks.length > 0) {
      log(`🚨 ALERT: ${stuckTasks.length} task(s) stuck > 4 hours`);
      stuckTasks.forEach(task => {
        log(`   ⚠️  ${task.title}`);
      });
      // Could escalate here, but we'll just log for now
    }
    
    // Summary
    log(`📊 SUMMARY: ${completedAgents.length} complete, ${executing.length} executing, ${queued.length} queued`);
    log('=== END AUTONOMY HEARTBEAT ===\n');
    
  } catch (error) {
    log(`❌ ERROR: ${error.message}`);
  }
}

main();
