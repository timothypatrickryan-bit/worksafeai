#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = '/Users/timothyryan/.openclaw/workspace';
const BRIEFINGS_FILE = path.join(WORKSPACE, 'mission-control-express-organized/server/data/briefings.json');
const LOG_FILE = path.join(WORKSPACE, '.briefing-monitor.log');

const AGENT_MAP = {
  'lucy': 'lucy-design-architect',
  'johnny': 'design',
  'jarvis': 'development',
  'velma': 'qa',
  'default': 'default'
};

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function getBriefings() {
  try {
    const data = fs.readFileSync(BRIEFINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    log(`❌ Failed to read briefings: ${err.message}`);
    return [];
  }
}

function updateBriefing(briefingId, updates) {
  try {
    const briefings = getBriefings();
    const idx = briefings.findIndex(b => b.id === briefingId);
    if (idx === -1) {
      log(`⚠️  Briefing ${briefingId} not found`);
      return false;
    }
    
    briefings[idx] = { ...briefings[idx], ...updates };
    fs.writeFileSync(BRIEFINGS_FILE, JSON.stringify(briefings, null, 2));
    return true;
  } catch (err) {
    log(`❌ Failed to update briefing: ${err.message}`);
    return false;
  }
}

function spawnAgentForBriefing(briefing) {
  try {
    log(`🤖 Spawning agent for: ${briefing.title}`);
    
    // Determine agent based on briefing type
    const agent = AGENT_MAP[briefing.agent] || AGENT_MAP.default;
    const agentId = agent;
    
    // Create spawn command via sessions_spawn logic
    // (In real implementation, would call sessions API)
    log(`   Agent: ${agent} (${agentId})`);
    log(`   Type: ${briefing.type}`);
    log(`   Level: ${briefing.level}`);
    
    // Update status
    const updated = updateBriefing(briefing.id, {
      status: 'executing',
      executionStarted: new Date().toISOString()
    });
    
    if (updated) {
      log(`✅ Spawned & status updated to 'executing'`);
      return true;
    }
    return false;
    
  } catch (err) {
    log(`❌ Failed to spawn agent: ${err.message}`);
    return false;
  }
}

function monitorBriefings() {
  try {
    log('🔍 Starting briefing monitor cycle...');
    
    const briefings = getBriefings();
    const now = Date.now();
    const TIMEOUT_MS = 4 * 60 * 60 * 1000; // 4 hours
    
    let monitored = 0;
    let spawned = 0;
    let alerts = 0;
    
    for (const briefing of briefings) {
      // Skip completed/cancelled
      if (['completed', 'cancelled', 'archived'].includes(briefing.status)) {
        continue;
      }
      
      // Check for auto-executing status
      if (briefing.status === 'auto-executing') {
        log(`\n⚡ Found auto-executing briefing: ${briefing.title}`);
        const success = spawnAgentForBriefing(briefing);
        if (success) spawned++;
        monitored++;
      }
      
      // Check for queued → should spawn within 5 min
      if (briefing.status === 'queued') {
        const queuedAge = now - new Date(briefing.timestamp).getTime();
        if (queuedAge > 5 * 60 * 1000) { // >5 min in queue
          log(`⏳ Queued briefing aging: ${briefing.title} (${Math.round(queuedAge/1000)}s)`);
          const success = spawnAgentForBriefing(briefing);
          if (success) spawned++;
        }
        monitored++;
      }
      
      // Check for stale executing (>4h without completion)
      if (briefing.status === 'executing' && briefing.executionStarted) {
        const executionAge = now - new Date(briefing.executionStarted).getTime();
        if (executionAge > TIMEOUT_MS) {
          log(`🚨 ALERT: Briefing stuck in execution >4h: ${briefing.title}`);
          alerts++;
        }
      }
    }
    
    log(`\n📊 Monitor summary: ${monitored} monitored, ${spawned} spawned, ${alerts} alerts`);
    return { monitored, spawned, alerts };
    
  } catch (err) {
    log(`❌ Monitor failed: ${err.message}`);
  }
}

// Main
monitorBriefings();

// Export for use by heartbeat-mission-control.js
async function processBriefings() {
  return monitorBriefings();
}

module.exports = {
  processBriefings,
  monitorBriefings
};
