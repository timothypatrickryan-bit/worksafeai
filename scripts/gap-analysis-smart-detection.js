#!/usr/bin/env node

/**
 * Smart Progress Detection for Gap Analysis
 * 
 * Auto-detects progress from observable signals:
 * - Git commits
 * - Deployments
 * - Task completion
 * - Agent activity
 * 
 * Usage:
 *   node scripts/gap-analysis-smart-detection.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = path.join(__dirname, '..');
const GAP_HISTORY_FILE = path.join(WORKSPACE, '.gap-analysis-history.json');

// Get most recent assessment
function getMostRecentAssessment() {
  if (!fs.existsSync(GAP_HISTORY_FILE)) return null;
  const history = JSON.parse(fs.readFileSync(GAP_HISTORY_FILE, 'utf8'));
  return history.assessments?.[0] || null;
}

// Detect project deployments (from .vercel or git log)
function detectRecentDeployments(days = 7) {
  try {
    // Check for vercel deployment files
    const vercelLogPath = path.join(WORKSPACE, '.vercel');
    if (fs.existsSync(vercelLogPath)) {
      const files = fs.readdirSync(vercelLogPath);
      return files.length > 0 ? 1 : 0; // Simple indicator
    }
  } catch (e) {
    // Ignore
  }
  return 0;
}

// Detect git activity
function detectGitActivity(days = 7) {
  try {
    const cmd = `cd "${WORKSPACE}" && git log --since="${days} days ago" --oneline 2>/dev/null | wc -l`;
    const output = execSync(cmd, { encoding: 'utf8' }).trim();
    return parseInt(output) || 0;
  } catch (e) {
    return 0;
  }
}

// Detect task completion (from state file)
function detectTaskCompletion() {
  try {
    const stateFile = path.join(WORKSPACE, '.mission-control-state.json');
    if (!fs.existsSync(stateFile)) return 0;
    
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    const completeTasks = (state.tasks || []).filter(t => t.status === 'complete').length;
    return completeTasks;
  } catch (e) {
    return 0;
  }
}

// Detect agent activity
function detectAgentActivity() {
  try {
    const stateFile = path.join(WORKSPACE, '.mission-control-state.json');
    if (!fs.existsSync(stateFile)) return 0;
    
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    const activeAgents = Object.values(state.agents || {}).filter(
      a => a.status === 'working' || a.status === 'complete'
    ).length;
    return activeAgents;
  } catch (e) {
    return 0;
  }
}

// Calculate assessment age
function getAssessmentAge(assessment) {
  if (!assessment) return Infinity;
  const created = new Date(assessment.timestamp);
  const now = new Date();
  const daysOld = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  return daysOld;
}

// Get confidence level
function getConfidenceLevel(daysOld) {
  if (daysOld <= 7) return { level: 'HIGH', emoji: '🟢', color: 'green' };
  if (daysOld <= 14) return { level: 'MODERATE', emoji: '🟡', color: 'yellow' };
  return { level: 'LOW', emoji: '🔴', color: 'red' };
}

// Main detection function
function runSmartDetection() {
  console.log('\n' + '═'.repeat(60));
  console.log('  📊 SMART PROGRESS DETECTION');
  console.log('═'.repeat(60));

  const assessment = getMostRecentAssessment();
  const daysOld = getAssessmentAge(assessment);
  const confidence = getConfidenceLevel(daysOld);

  console.log(`\n${confidence.emoji} Assessment Age: ${daysOld} days`);
  console.log(`   Confidence Level: ${confidence.level}`);

  if (assessment) {
    console.log(`   Latest: "${assessment.name}" (${assessment.date})\n`);
  } else {
    console.log('   ⚠️  No assessment found\n');
    return { confidence, signals: {} };
  }

  // Detect progress signals
  console.log('📈 PROGRESS SIGNALS (Last 7 days):');
  console.log('─'.repeat(60));

  const signals = {
    gitCommits: detectGitActivity(7),
    deployments: detectRecentDeployments(7),
    tasksCompleted: detectTaskCompletion(),
    agentsActive: detectAgentActivity(),
  };

  console.log(`✅ Git Commits: ${signals.gitCommits}`);
  console.log(`📦 Deployments: ${signals.deployments > 0 ? 'Yes' : 'None detected'}`);
  console.log(`✓ Tasks Completed: ${signals.tasksCompleted}`);
  console.log(`🤖 Active Agents: ${signals.agentsActive}`);

  // Assess progress
  const totalSignals = signals.gitCommits + signals.deployments + signals.tasksCompleted + signals.agentsActive;
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 ASSESSMENT:');
  console.log('═'.repeat(60));

  if (daysOld <= 7) {
    console.log('\n✅ CURRENT - Assessment is fresh and reliable');
    console.log('   Continue daily reviews with confidence');
  } else if (daysOld <= 14) {
    console.log('\n⚠️  AGING - Assessment is getting stale');
    if (totalSignals > 5) {
      console.log('   Significant progress detected - Consider updating assessment soon');
    } else {
      console.log('   Limited progress - Assessment still relevant');
    }
  } else {
    console.log('\n🔴 STALE - Assessment is outdated');
    console.log('   Do a full re-assessment to realign with current reality');
    if (totalSignals > 0) {
      console.log(`   Progress detected (${totalSignals} signals) - Status likely improved!`);
    }
  }

  return { confidence, signals, daysOld, totalSignals };
}

// Run it
try {
  const result = runSmartDetection();
  console.log('\n' + '═'.repeat(60) + '\n');
  process.exit(0);
} catch (err) {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
}
