#!/usr/bin/env node

/**
 * Lucy's Autonomy Heartbeat — Enhanced with Gap Remediation Tracking
 * Runs every 30 minutes
 * 
 * Checks for:
 * - Completed agent work (status: "complete")
 * - Quality review (deliverables check)
 * - State sync (update mission-control-state.json)
 * - Gap remediation tracking (when gaps identified, briefings spawned, work completed)
 * - Next work assignment (assign highest-priority task)
 * - Log all transitions
 * 
 * This is the CORE autonomy loop that keeps work flowing continuously
 * and maintains gap remediation lifecycle from identification → completion
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const WORKSPACE = path.join(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');
const AUTONOMY_LOG = path.join(WORKSPACE, '.autonomy-log.txt');

// Load gap remediation manager
const gapManager = require('./gap-remediation-manager');

// Load auto-router
const autoRouter = require('./task-auto-router');

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

/**
 * When a gap is identified, record it in gap remediations
 * Typically called from daily gap analysis or smart detection
 */
function recordGapIdentified(gap) {
  try {
    // Check if remediation already exists for this gap
    const state = gapManager.readState();
    if (state && state.gapRemediations) {
      const existing = state.gapRemediations.find(r => 
        r.gapIdentified === gap.gapIdentified && r.status === 'identified'
      );
      if (existing) {
        log(`⏭️  Gap already recorded (${existing.id}): ${gap.gapIdentified}`);
        return existing;
      }
    }
    
    // Create new remediation record
    const record = gapManager.addRemediation(gap);
    if (record) {
      log(`🆕 Gap remediation recorded (${record.id}): ${record.gapIdentified}`);
      return record;
    }
  } catch (err) {
    log(`⚠️  Error recording gap: ${err.message}`);
  }
  return null;
}

/**
 * When a briefing is spawned for a gap, update remediation status
 */
function recordBriefingSpawned(remediationId, briefingId, briefingTitle) {
  try {
    const record = gapManager.markBriefingSpawned(remediationId, briefingId, briefingTitle);
    if (record) {
      log(`🎯 Remediation status updated (${remediationId}): briefing-spawned`);
      return record;
    }
  } catch (err) {
    log(`⚠️  Error updating remediation: ${err.message}`);
  }
  return null;
}

/**
 * When a briefing completes (detected from autonomy log), update remediation
 * Reads hours from autonomy log entry
 */
function recordBriefingCompletion(remediationId, hoursSpent, impact, scoreAfter) {
  try {
    const record = gapManager.markComplete(remediationId, impact, hoursSpent, scoreAfter);
    if (record) {
      log(`✅ Remediation completed (${remediationId}): ${record.gapIdentified}`);
      log(`   Hours: estimated ${record.estimatedHours}h → actual ${hoursSpent}h`);
      log(`   Score: ${record.scoreBefore} → ${scoreAfter}`);
      return record;
    }
  } catch (err) {
    log(`⚠️  Error marking remediation complete: ${err.message}`);
  }
  return null;
}

/**
 * Report on gap remediation health
 */
function reportGapHealth() {
  try {
    const summary = gapManager.getBySummary();
    if (summary.totalGaps === 0) return;
    
    log(`\n📊 GAP REMEDIATION HEALTH:`);
    log(`   Total gaps: ${summary.totalGaps}`);
    log(`   Identified: ${summary.identified} | Briefing spawned: ${summary.briefingSpawned} | In progress: ${summary.inProgress} | Completed: ${summary.completed}`);
    log(`   Completion rate: ${summary.completionRate}%`);
    log(`   Hours: ${summary.totalHoursActual}/${summary.totalHoursEstimated}h (est)`);
    log(`   Avg score: ${summary.avgScoreBefore} → ${summary.avgScoreAfter}`);
    
    // By swimlane
    if (Object.keys(summary.bySwimline).length > 0) {
      log(`   By swimlane:`);
      Object.entries(summary.bySwimline).forEach(([swimlane, stats]) => {
        log(`     • ${swimlane}: ${stats.completed}/${stats.count} completed`);
      });
    }
  } catch (err) {
    log(`⚠️  Error reporting gap health: ${err.message}`);
  }
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
      
      // NEW: Auto-route queued tasks to best-fit agents
      log(`🤖 Attempting auto-routing for queued tasks...`);
      const routingResult = autoRouter.runAutoRouter();
      if (routingResult) {
        log(`✅ Auto-routing complete: ${routingResult.routed}/${routingResult.totalQueued} routed`);
      }
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
    }
    
    // Check 5: Gap remediation health
    reportGapHealth();
    
    // Summary
    log(`\n📊 SUMMARY: ${completedAgents.length} complete, ${executing.length} executing, ${queued.length} queued`);
    log('=== END AUTONOMY HEARTBEAT ===\n');
    
  } catch (error) {
    log(`❌ ERROR: ${error.message}`);
  }
}

// Export functions for use by other scripts
module.exports = {
  recordGapIdentified,
  recordBriefingSpawned,
  recordBriefingCompletion,
  reportGapHealth,
  main
};

// Run if executed directly
if (require.main === module) {
  main();
}
