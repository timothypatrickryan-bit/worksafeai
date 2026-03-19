#!/usr/bin/env node

/**
 * Weekly Gap Analysis Quick Check Prompt
 * 
 * Runs every Friday to remind you to do a quick 5-minute assessment update
 * 
 * Usage:
 *   node scripts/gap-analysis-weekly-prompt.js
 * 
 * Schedule:
 *   Run weekly (Fridays @ 4 PM EST via cron: 0 16 * * 5)
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..');
const GAP_HISTORY_FILE = path.join(WORKSPACE, '.gap-analysis-history.json');
const MEMORY_DIR = path.join(WORKSPACE, 'memory');

// Ensure memory directory exists
if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

// Get today's date
function getTodayDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Get daily memory file path
function getDailyMemoryPath() {
  return path.join(MEMORY_DIR, `${getTodayDate()}.md`);
}

// Get most recent assessment
function getMostRecentAssessment() {
  if (!fs.existsSync(GAP_HISTORY_FILE)) return null;
  const history = JSON.parse(fs.readFileSync(GAP_HISTORY_FILE, 'utf8'));
  return history.assessments?.[0] || null;
}

// Calculate age
function getAssessmentAge(assessment) {
  if (!assessment) return Infinity;
  const created = new Date(assessment.timestamp);
  const now = new Date();
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
}

// Main prompt
function weeklyPrompt() {
  console.log('\n' + '═'.repeat(60));
  console.log('  📅 WEEKLY GAP ANALYSIS CHECK-IN');
  console.log('═'.repeat(60));

  const assessment = getMostRecentAssessment();
  const daysOld = getAssessmentAge(assessment);

  if (!assessment) {
    console.log('\n⚠️  No assessments found yet.');
    console.log('   Go to Mission Control → Gap Analysis → Save your first assessment!\n');
    logToMemory('No assessments found. Prompted to create initial assessment.');
    return;
  }

  console.log(`\nLatest Assessment: "${assessment.name}"`);
  console.log(`Age: ${daysOld} days\n`);

  if (daysOld <= 7) {
    console.log('✅ Assessment is fresh!');
    console.log('   No update needed yet. Keep focusing on daily recommendations.\n');
    logToMemory(`Weekly check: Assessment is ${daysOld} days old (fresh). No update needed.`);
  } else if (daysOld <= 14) {
    console.log('⏰ Time for a quick update!');
    console.log('\n   Quick 5-min check-in questions:');
    console.log('   • Did you make progress on this week\'s focus areas?');
    console.log('   • Are any swimlane scores improving?');
    console.log('   • Any new blockers or challenges?');
    console.log('\n   Instructions:');
    console.log('   1. Go to Mission Control → Gap Analysis');
    console.log('   2. Quickly re-grade the top 3 swimlanes');
    console.log('   3. Save as "Week of [DATE] - Quick Check"\n');
    logToMemory(`Weekly check: Assessment is ${daysOld} days old. Prompted for quick update.`);
  } else {
    console.log('🔴 OVERDUE - Do a full re-assessment!');
    console.log(`\n   Assessment is ${daysOld} days old. Time to sync with reality.`);
    console.log('\n   Full assessment (20-30 min):');
    console.log('   1. Go to Mission Control → Gap Analysis');
    console.log('   2. Review each swimlane carefully');
    console.log('   3. Grade all 18 items based on current state');
    console.log('   4. Save as "Month of [DATE] - Full Assessment"\n');
    logToMemory(`Weekly check: Assessment is ${daysOld} days old (STALE). Prompted for full re-assessment.`);
  }

  console.log('═'.repeat(60) + '\n');
}

// Log to daily memory
function logToMemory(message) {
  const memoryFile = getDailyMemoryPath();
  
  let content = '';
  if (fs.existsSync(memoryFile)) {
    content = fs.readFileSync(memoryFile, 'utf8');
  }
  
  const entry = `\n## 📅 Weekly Gap Analysis Check-In (${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })})\n\n${message}\n`;
  
  fs.writeFileSync(memoryFile, content + entry);
}

// Run it
try {
  weeklyPrompt();
  process.exit(0);
} catch (err) {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
}
