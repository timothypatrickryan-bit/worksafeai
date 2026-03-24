#!/usr/bin/env node

/**
 * Dashboard Event Listener
 * 
 * Monitors workspace for significant events and triggers dashboard updates:
 * - Task completion
 * - Agent status changes
 * - Project milestone achievements
 * - Briefing approvals
 * - Work progress
 * 
 * Watches key files for changes and updates the dashboard immediately when detected.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = '/Users/timothyryan/.openclaw/workspace';
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');
const EVENT_LOG = path.join(WORKSPACE, '.dashboard-events.log');

const WATCH_PATHS = [
  path.join(WORKSPACE, '.autonomy-log.txt'),
  path.join(WORKSPACE, '.mission-control-state.json'),
  path.join(WORKSPACE, 'projects'),
  path.join(WORKSPACE, 'memory')
];

let watchTimestamps = {};

function log(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}`;
  console.log(logEntry);
  
  try {
    fs.appendFileSync(EVENT_LOG, logEntry + '\n');
  } catch (e) {
    // Ignore
  }
}

function triggerDashboardRefresh(reason) {
  try {
    log(`📡 Event: ${reason} → Triggering dashboard refresh`);
    execSync('node /Users/timothyryan/.openclaw/workspace/scripts/dashboard-refresh-daemon.js', {
      stdio: 'pipe'
    });
    log(`✅ Dashboard refreshed`);
  } catch (error) {
    log(`⚠️ Refresh failed: ${error.message}`);
  }
}

function checkFileChanged(filepath) {
  try {
    const stats = fs.statSync(filepath);
    const lastMod = stats.mtimeMs;
    const lastCheck = watchTimestamps[filepath] || 0;
    
    if (lastMod > lastCheck) {
      watchTimestamps[filepath] = lastMod;
      return true;
    }
  } catch (e) {
    // File may not exist
  }
  return false;
}

function monitorAutonomyLog() {
  const logFile = path.join(WORKSPACE, '.autonomy-log.txt');
  
  if (!checkFileChanged(logFile)) {
    return;
  }
  
  try {
    const content = fs.readFileSync(logFile, 'utf-8');
    const lines = content.split('\n');
    const lastLine = lines[lines.length - 2] || '';
    
    // Check for completion signals
    if (lastLine.includes('SUMMARY')) {
      triggerDashboardRefresh('Autonomy loop completed');
    } else if (lastLine.includes('completed')) {
      triggerDashboardRefresh('Agent work completed');
    }
  } catch (e) {
    // Ignore read errors
  }
}

function monitorTaskCompletion() {
  const stateFile = path.join(WORKSPACE, '.mission-control-state.json');
  
  if (!checkFileChanged(stateFile)) {
    return;
  }
  
  try {
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    const tasks = state.tasks || [];
    
    // Count recently completed tasks
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentCompleted = tasks.filter(t => 
      (t.status === 'completed' || t.completedAt) && 
      t.completedAt > oneHourAgo
    );
    
    if (recentCompleted.length > 0) {
      triggerDashboardRefresh(`${recentCompleted.length} tasks completed`);
    }
  } catch (e) {
    // Ignore
  }
}

function main() {
  log('🎯 Dashboard Event Listener started');
  log(`Monitoring: ${WATCH_PATHS.join(', ')}`);
  
  // If --daemon flag, run continuously
  if (process.argv.includes('--daemon')) {
    log('📅 Running as daemon (checks every 30 seconds)');
    
    setInterval(() => {
      monitorAutonomyLog();
      monitorTaskCompletion();
    }, 30 * 1000); // Check every 30 seconds
    
    process.stdin.resume();
  } else {
    log('✅ Single check complete. Use --daemon flag for continuous monitoring');
    monitorAutonomyLog();
    monitorTaskCompletion();
    process.exit(0);
  }
}

main();
