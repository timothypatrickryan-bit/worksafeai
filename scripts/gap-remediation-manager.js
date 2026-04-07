#!/usr/bin/env node

/**
 * Gap Remediation Manager (Stub Implementation)
 * 
 * Manages gap identification and remediation tracking.
 * This is a minimal implementation to support the autonomy heartbeat.
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.dirname(__dirname);
const GAP_REMEDIATION_FILE = path.join(WORKSPACE, '.gap-remediations.json');

/**
 * Initialize gap remediation file
 */
function initRemediations() {
  if (!fs.existsSync(GAP_REMEDIATION_FILE)) {
    fs.writeFileSync(GAP_REMEDIATION_FILE, JSON.stringify({
      remediations: [],
      lastUpdate: new Date().toISOString()
    }, null, 2));
  }
}

/**
 * Read gap remediations
 */
function readState() {
  try {
    initRemediations();
    return JSON.parse(fs.readFileSync(GAP_REMEDIATION_FILE, 'utf8'));
  } catch (err) {
    console.error(`Failed to read gap remediations: ${err.message}`);
    return { remediations: [], lastUpdate: new Date().toISOString() };
  }
}

/**
 * Write gap remediations
 */
function writeState(state) {
  try {
    state.lastUpdate = new Date().toISOString();
    fs.writeFileSync(GAP_REMEDIATION_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error(`Failed to write gap remediations: ${err.message}`);
  }
}

/**
 * Add a new gap remediation record
 */
function addRemediation(gap) {
  const state = readState();
  const remediation = {
    id: `gap-${Date.now()}`,
    gapIdentified: gap.gapIdentified || gap.description || 'unknown',
    status: 'identified',
    createdAt: new Date().toISOString(),
    briefingSpawned: null,
    briefingId: null,
    briefingTitle: null,
    completedAt: null,
    impact: null,
    hoursSpent: null,
    scoreBefore: null,
    scoreAfter: null
  };
  
  state.remediations.push(remediation);
  writeState(state);
  return remediation;
}

/**
 * Mark that a briefing was spawned for a remediation
 */
function markBriefingSpawned(remediationId, briefingId, briefingTitle) {
  const state = readState();
  const remediation = state.remediations.find(r => r.id === remediationId);
  
  if (remediation) {
    remediation.briefingSpawned = new Date().toISOString();
    remediation.briefingId = briefingId;
    remediation.briefingTitle = briefingTitle;
    remediation.status = 'briefing-spawned';
    writeState(state);
  }
  
  return remediation;
}

/**
 * Mark a remediation as complete
 */
function markComplete(remediationId, impact, hoursSpent, scoreAfter) {
  const state = readState();
  const remediation = state.remediations.find(r => r.id === remediationId);
  
  if (remediation) {
    remediation.completedAt = new Date().toISOString();
    remediation.status = 'complete';
    remediation.impact = impact;
    remediation.hoursSpent = hoursSpent;
    remediation.scoreAfter = scoreAfter;
    writeState(state);
  }
  
  return remediation;
}

/**
 * Get summary of gap remediation health
 */
function getBySummary() {
  const state = readState();
  const remediations = state.remediations || [];
  
  const identified = remediations.filter(r => r.status === 'identified').length;
  const briefingSpawned = remediations.filter(r => r.status === 'briefing-spawned').length;
  const inProgress = identified + briefingSpawned;
  const completed = remediations.filter(r => r.status === 'complete').length;
  const total = remediations.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const hoursData = remediations
    .filter(r => r.hoursSpent)
    .map(r => r.hoursSpent);
  const avgHours = hoursData.length > 0 
    ? (hoursData.reduce((a, b) => a + b, 0) / hoursData.length).toFixed(1)
    : 0;
  
  const scoreData = remediations
    .filter(r => r.scoreAfter)
    .map(r => r.scoreAfter);
  const scoreBeforeData = remediations
    .filter(r => r.scoreBefore)
    .map(r => r.scoreBefore);
  
  const avgScoreBefore = scoreBeforeData.length > 0 
    ? (scoreBeforeData.reduce((a, b) => a + b, 0) / scoreBeforeData.length).toFixed(1)
    : 0;
  
  const avgScoreAfter = scoreData.length > 0
    ? (scoreData.reduce((a, b) => a + b, 0) / scoreData.length).toFixed(1)
    : 0;
  
  return {
    total: total,
    identified: identified,
    briefingSpawned: briefingSpawned,
    inProgress: inProgress,
    completed: completed,
    completionRate: completionRate,
    totalHoursEstimated: total > 0 ? (total * 8).toFixed(1) : 0,
    totalHoursActual: avgHours,
    avgScoreBefore: avgScoreBefore,
    avgScoreAfter: avgScoreAfter,
    bySwimline: {}
  };
}

module.exports = {
  initRemediations,
  readState,
  writeState,
  addRemediation,
  markBriefingSpawned,
  markComplete,
  getBySummary
};
