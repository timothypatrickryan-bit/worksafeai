#!/usr/bin/env node

/**
 * Gap Remediation Manager
 * 
 * Utility module for reading/writing gap remediation records
 * Works with .mission-control-state.json gapRemediations array
 * 
 * USAGE:
 *   const mgr = require('./gap-remediation-manager');
 *   mgr.addRemediation({...gap});
 *   mgr.markComplete(id, impact, hoursSpent, scoreAfter);
 *   const summary = mgr.getBySummary();
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');

/**
 * Read state file
 */
function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (err) {
    console.error(`Failed to read state file: ${err.message}`);
    return null;
  }
}

/**
 * Write state file
 */
function writeState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
    state.lastUpdate = new Date().toISOString();
    return true;
  } catch (err) {
    console.error(`Failed to write state file: ${err.message}`);
    return false;
  }
}

/**
 * Generate unique remediation ID
 */
function generateRemediationId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `rem-${timestamp}-${random}`;
}

/**
 * Add a new gap remediation record
 * @param {Object} gap - Gap details
 * @returns {Object} - Created remediation record
 */
function addRemediation(gap) {
  const state = readState();
  if (!state) return null;
  
  if (!state.gapRemediations) {
    state.gapRemediations = [];
  }
  
  const record = {
    id: generateRemediationId(),
    gapIdentified: gap.gapIdentified || gap.description || 'Unnamed gap',
    swimlane: gap.swimlane || 'value',
    scoreBefore: gap.scoreBefore || 2.0,
    detectedDate: gap.detectedDate || new Date().toISOString().split('T')[0],
    detectedBy: gap.detectedBy || 'manual',
    briefingId: gap.briefingId || null,
    briefingTitle: gap.briefingTitle || null,
    status: 'identified',
    startedDate: null,
    completedDate: null,
    estimatedHours: gap.estimatedHours || 8,
    actualHoursSpent: 0,
    progressPercent: 0,
    scoreAfter: null,
    impact: null,
    notes: gap.notes || ''
  };
  
  state.gapRemediations.push(record);
  state.lastUpdate = new Date().toISOString();
  
  if (!writeState(state)) {
    return null;
  }
  
  return record;
}

/**
 * Update an existing remediation record
 * @param {String} id - Remediation ID
 * @param {Object} updates - Fields to update
 * @returns {Object} - Updated record or null
 */
function updateRemediation(id, updates) {
  const state = readState();
  if (!state || !state.gapRemediations) return null;
  
  const record = state.gapRemediations.find(r => r.id === id);
  if (!record) return null;
  
  Object.assign(record, updates);
  state.lastUpdate = new Date().toISOString();
  
  if (!writeState(state)) {
    return null;
  }
  
  return record;
}

/**
 * Mark a remediation as complete
 * @param {String} id - Remediation ID
 * @param {String} impact - Impact description
 * @param {Number} hoursSpent - Actual hours spent
 * @param {Number} scoreAfter - Score after remediation
 * @returns {Object} - Updated record
 */
function markComplete(id, impact, hoursSpent, scoreAfter) {
  return updateRemediation(id, {
    status: 'completed',
    completedDate: new Date().toISOString().split('T')[0],
    actualHoursSpent: hoursSpent,
    progressPercent: 100,
    scoreAfter: scoreAfter,
    impact: impact
  });
}

/**
 * Get all non-completed remediations (identified, in-progress, briefing-spawned)
 * @returns {Array}
 */
function getActive() {
  const state = readState();
  if (!state || !state.gapRemediations) return [];
  
  return state.gapRemediations.filter(r => 
    r.status !== 'completed' && r.status !== 'cancelled'
  );
}

/**
 * Get all completed remediations
 * @returns {Array}
 */
function getCompleted() {
  const state = readState();
  if (!state || !state.gapRemediations) return [];
  
  return state.gapRemediations.filter(r => r.status === 'completed');
}

/**
 * Filter remediations by swimlane
 * @param {String} swimlane - Swimlane name
 * @returns {Array}
 */
function getBySwimline(swimlane) {
  const state = readState();
  if (!state || !state.gapRemediations) return [];
  
  return state.gapRemediations.filter(r => r.swimlane === swimlane);
}

/**
 * Get summary statistics for dashboard
 * @returns {Object}
 */
function getBySummary() {
  const state = readState();
  if (!state || !state.gapRemediations) {
    return {
      totalGaps: 0,
      identified: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      avgScoreBefore: 0,
      avgScoreAfter: 0,
      totalHoursEstimated: 0,
      totalHoursActual: 0,
      bySwimline: {}
    };
  }
  
  const remediations = state.gapRemediations;
  const swimlanes = ['value', 'autonomy', 'organization', 'scale', 'reliability', 'human'];
  
  const summary = {
    totalGaps: remediations.length,
    identified: remediations.filter(r => r.status === 'identified').length,
    briefingSpawned: remediations.filter(r => r.status === 'briefing-spawned').length,
    inProgress: remediations.filter(r => r.status === 'in-progress').length,
    completed: remediations.filter(r => r.status === 'completed').length,
    cancelled: remediations.filter(r => r.status === 'cancelled').length,
    avgScoreBefore: 0,
    avgScoreAfter: 0,
    totalHoursEstimated: 0,
    totalHoursActual: 0,
    completionRate: 0,
    bySwimline: {}
  };
  
  // Calculate averages
  const scores = remediations.map(r => r.scoreBefore).filter(s => s);
  const scoresAfter = remediations.filter(r => r.scoreAfter).map(r => r.scoreAfter);
  
  if (scores.length > 0) {
    summary.avgScoreBefore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
  }
  
  if (scoresAfter.length > 0) {
    summary.avgScoreAfter = (scoresAfter.reduce((a, b) => a + b, 0) / scoresAfter.length).toFixed(2);
  }
  
  summary.totalHoursEstimated = remediations.reduce((sum, r) => sum + (r.estimatedHours || 0), 0);
  summary.totalHoursActual = remediations.reduce((sum, r) => sum + (r.actualHoursSpent || 0), 0);
  summary.completionRate = summary.totalGaps > 0 
    ? ((summary.completed / summary.totalGaps) * 100).toFixed(1) 
    : 0;
  
  // By swimlane breakdown
  swimlanes.forEach(swimlane => {
    const bySwim = remediations.filter(r => r.swimlane === swimlane);
    if (bySwim.length > 0) {
      summary.bySwimline[swimlane] = {
        count: bySwim.length,
        completed: bySwim.filter(r => r.status === 'completed').length,
        avgScore: (bySwim.map(r => r.scoreBefore).reduce((a, b) => a + b, 0) / bySwim.length).toFixed(2)
      };
    }
  });
  
  return summary;
}

/**
 * Get a specific remediation by ID
 * @param {String} id - Remediation ID
 * @returns {Object}
 */
function getById(id) {
  const state = readState();
  if (!state || !state.gapRemediations) return null;
  
  return state.gapRemediations.find(r => r.id === id) || null;
}

/**
 * Update remediation status to briefing-spawned
 * @param {String} id - Remediation ID
 * @param {String} briefingId - Briefing ID
 * @param {String} briefingTitle - Briefing title
 * @returns {Object}
 */
function markBriefingSpawned(id, briefingId, briefingTitle) {
  return updateRemediation(id, {
    status: 'briefing-spawned',
    briefingId: briefingId,
    briefingTitle: briefingTitle,
    startedDate: new Date().toISOString().split('T')[0]
  });
}

/**
 * Update remediation status to in-progress
 * @param {String} id - Remediation ID
 * @returns {Object}
 */
function markInProgress(id) {
  return updateRemediation(id, {
    status: 'in-progress',
    startedDate: new Date().toISOString().split('T')[0]
  });
}

module.exports = {
  addRemediation,
  updateRemediation,
  markComplete,
  markBriefingSpawned,
  markInProgress,
  getActive,
  getCompleted,
  getBySwimline,
  getBySummary,
  getById,
  readState,
  writeState
};
