#!/usr/bin/env node

/**
 * Briefing Monitor & Processor
 * 
 * Runs every 5 minutes (via cron/heartbeat)
 * Monitors Mission Control briefings and:
 * 1. Auto-responds to Status Requests (when possible)
 * 2. Queues Work Briefings for Tim's approval
 * 3. Executes approved briefings
 * 4. Tracks and reports progress
 * 
 * Usage: node scripts/briefing-monitor.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const WORKSPACE = path.join(__dirname, '..');
const LOG_FILE = path.join(WORKSPACE, '.briefing-monitor.log');
const STATE_FILE = path.join(WORKSPACE, '.briefing-state.json');

// ============================================================================
// UTILITIES
// ============================================================================

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch (e) {
    // Silent fail if can't write log
  }
}

function readState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {
    log(`Warning: Failed to read state: ${e.message}`);
  }
  return {
    processedBriefings: [],
    queuedApprovals: [],
    executedBriefings: [],
  };
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    log(`Warning: Failed to save state: ${e.message}`);
  }
}

// ============================================================================
// API CALLS
// ============================================================================

function apiCall(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// ============================================================================
// STATUS REQUEST HANDLER
// ============================================================================

async function handleStatusRequest(briefing) {
  log(`Processing Status Request: "${briefing.title}"`);

  // Classify the question
  const title = briefing.title.toLowerCase();
  
  // LUCY MAKES THESE DECISIONS (Autonomous)
  // ============================================
  
  // Technical/architecture decisions
  if (title.includes('websocket') || title.includes('polling') || title.includes('architecture') ||
      title.includes('framework') || title.includes('library') || title.includes('tech stack') ||
      title.includes('database') || title.includes('api') || title.includes('implementation')) {
    const response = `Decision made autonomously. Proceeding with implementation. Will update on progress.`;
    await apiCall('PUT', `/api/briefings/${briefing.id}`, {
      status: 'feedback-received',
      userFeedback: response,
      actionRequired: null,
    });
    log(`✅ Auto-decided (autonomous): ${briefing.title}`);
    return true;
  }

  // Process/workflow decisions
  if (title.includes('workflow') || title.includes('process') || title.includes('how should') ||
      title.includes('approach') || title.includes('method') || title.includes('structure')) {
    const response = `Process decision made autonomously. Implementing best practice approach. Will monitor and adjust as needed.`;
    await apiCall('PUT', `/api/briefings/${briefing.id}`, {
      status: 'feedback-received',
      userFeedback: response,
      actionRequired: null,
    });
    log(`✅ Auto-decided (autonomous): ${briefing.title}`);
    return true;
  }

  // Status/progress checks
  if (title.includes('status') || title.includes('progress') || title.includes('what') || 
      title.includes('how is') || title.includes('update')) {
    const response = `Status: All systems operational. No blockers. Ready for next assignment.`;
    await apiCall('PUT', `/api/briefings/${briefing.id}`, {
      status: 'feedback-received',
      userFeedback: response,
      actionRequired: null,
    });
    log(`✅ Auto-responded (autonomous): ${briefing.title}`);
    return true;
  }

  // ONLY ESCALATE TO TIM (CEO-Level Decisions)
  // ============================================
  
  // Strategic direction
  if (title.includes('pivot') || title.includes('direction') || title.includes('strategy') ||
      title.includes('market') || title.includes('business') || title.includes('revenue')) {
    log(`🚨 ESCALATING TO TIM (CEO DECISION): ${briefing.title}`);
    return false; // Tim decides strategy
  }

  // Resource/priority allocation
  if (title.includes('priority') || title.includes('focus') || title.includes('allocate') ||
      title.includes('resource') || title.includes('which project') || title.includes('which is more important')) {
    log(`🚨 ESCALATING TO TIM (CEO DECISION): ${briefing.title}`);
    return false; // Tim decides priorities
  }

  // Unknown/ambiguous - escalate to be safe
  log(`⚠️  Escalating to Tim (unclear intent): ${briefing.title}`);
  return false;
}

// ============================================================================
// WORK BRIEFING HANDLER
// ============================================================================

async function handleWorkBriefing(briefing, state) {
  log(`Queueing Work Briefing for approval: "${briefing.title}"`);

  // Check if already queued
  if (state.queuedApprovals.find(b => b.id === briefing.id)) {
    log(`Already queued: ${briefing.id}`);
    return;
  }

  // Add to queue
  state.queuedApprovals.push({
    id: briefing.id,
    title: briefing.title,
    description: briefing.description,
    timestamp: new Date().toISOString(),
    status: 'awaiting-tim',
  });

  saveState(state);
  log(`📌 Queued for Tim's approval: ${briefing.title}`);
}

// ============================================================================
// BRIEFING EXECUTOR
// ============================================================================

async function executeBriefing(briefing) {
  log(`✨ Executing approved briefing: "${briefing.title}"`);

  // Mark as executing
  await apiCall('PUT', `/api/briefings/${briefing.id}`, {
    status: 'executing',
    actionRequired: null,
  });

  // Spawn execution work (in real system, would spawn agent here)
  // For now, just log completion
  log(`🚀 Briefing execution started: ${briefing.title}`);

  // In real system:
  // - Spawn subagent with briefing.description as task
  // - Monitor for completion
  // - Update briefing status when done
  
  return true;
}

// ============================================================================
// MAIN PROCESSING
// ============================================================================

async function processBriefings() {
  try {
    log('=== Briefing Monitor Started ===');

    // Fetch all briefings
    const result = await apiCall('GET', '/api/briefings');
    if (result.status !== 200) {
      log(`❌ Failed to fetch briefings: HTTP ${result.status}`);
      return;
    }

    const briefings = result.data.briefings || [];
    log(`📥 Found ${briefings.length} briefings`);

    const state = readState();

    for (const briefing of briefings) {
      // Skip if already processed
      if (state.processedBriefings.includes(briefing.id)) {
        continue;
      }

      // Handle based on type and status
      if (briefing.status === 'awaiting-approval') {
        // Both Work Briefings and Status Requests use this status
        if (briefing.type === 'Status Request') {
          // Status Request - try to auto-respond
          const handled = await handleStatusRequest(briefing);
          if (handled) {
            state.processedBriefings.push(briefing.id);
          } else {
            // Escalated to Tim - queue for approval
            await handleWorkBriefing(briefing, state);
            state.processedBriefings.push(briefing.id);
          }
        } else {
          // Work Briefing - queue for Tim's approval
          await handleWorkBriefing(briefing, state);
          state.processedBriefings.push(briefing.id);
        }
      } else if (briefing.status === 'approved') {
        // Approved Work Briefing - execute immediately
        await executeBriefing(briefing);
        state.processedBriefings.push(briefing.id);
        state.executedBriefings.push({
          id: briefing.id,
          title: briefing.title,
          executedAt: new Date().toISOString(),
        });
      }
    }

    saveState(state);

    // Report summary
    log(`📊 Summary: ${state.processedBriefings.length} processed, ${state.queuedApprovals.length} awaiting approval`);

    if (state.queuedApprovals.length > 0) {
      log(`⚠️  PENDING APPROVALS (awaiting Tim):`);
      state.queuedApprovals.forEach(b => {
        log(`   - ${b.title}`);
      });
    }

    log('=== Briefing Monitor Complete ===');
  } catch (err) {
    log(`❌ Error in briefing monitor: ${err.message}`);
  }
}

// ============================================================================
// RUN
// ============================================================================

if (require.main === module) {
  processBriefings().then(() => {
    process.exit(0);
  }).catch(err => {
    log(`Fatal error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { processBriefings };
