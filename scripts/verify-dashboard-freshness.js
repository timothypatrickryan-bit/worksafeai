#!/usr/bin/env node

/**
 * Verify Dashboard Freshness
 * 
 * Monitors that the Unified Dashboard state is staying up-to-date.
 * Runs on every heartbeat to alert if state is stale.
 * 
 * Usage:
 *   node scripts/verify-dashboard-freshness.js
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');
const MAX_STALE_MINUTES = 5; // Alert if state is >5 minutes old

function readState() {
  if (!fs.existsSync(STATE_FILE)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function checkFreshness() {
  const state = readState();
  
  if (!state) {
    console.log('⚠️ Dashboard state file not found!');
    return false;
  }
  
  const lastUpdate = new Date(state.lastUpdate);
  const now = new Date();
  const minutesOld = (now - lastUpdate) / 60000;
  
  console.log(`📊 Dashboard Freshness Check:`);
  console.log(`   Last Update: ${state.lastUpdate}`);
  console.log(`   Age: ${minutesOld.toFixed(2)} minutes`);
  
  if (minutesOld <= MAX_STALE_MINUTES) {
    console.log(`   Status: ✅ FRESH\n`);
    return true;
  } else {
    console.log(`   Status: ⚠️ STALE (>${MAX_STALE_MINUTES} min)\n`);
    console.log('⚠️ Alert: Dashboard state is outdated!');
    console.log('   Triggers: heartbeat-mission-control.js, lucy-task-automation.js, delegation-scanner');
    console.log(`   Fix: Ensure heartbeat cron is running (expected every ~30-40 min)\n`);
    return false;
  }
}

checkFreshness();
