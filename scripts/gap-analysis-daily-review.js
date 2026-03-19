#!/usr/bin/env node

/**
 * Daily Gap Analysis Review
 * 
 * Runs once per day to:
 * 1. Review current GAP Analysis grades
 * 2. Identify highest-impact improvements
 * 3. Create tasks to work toward mission
 * 4. Log progress to daily memory
 * 
 * Usage:
 *   node scripts/gap-analysis-daily-review.js
 * 
 * Schedule:
 *   Run daily via cron/launchd (suggest: 9 AM EST)
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');
const MEMORY_FILE = path.join(WORKSPACE, 'memory');

// Ensure memory directory exists
if (!fs.existsSync(MEMORY_FILE)) {
  fs.mkdirSync(MEMORY_FILE, { recursive: true });
}

// Helper: read state
function readState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { gap_analysis: {} };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

// Helper: write state
function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Helper: get today's date in YYYY-MM-DD format
function getTodayDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Helper: get daily memory file path
function getDailyMemoryPath() {
  return path.join(MEMORY_FILE, `${getTodayDate()}.md`);
}

// Mission statement
const MISSION = 'An autonomous organization of AI agents that does work for me and produces value 24/7';

// Gap Analysis swimlanes (priority order)
const SWIMLANES = [
  {
    id: 'autonomy',
    name: '🤖 Autonomy & Independence',
    priority: 'CRITICAL',
    description: 'Agents operate independently without constant human intervention',
    improvement: 'Increase agent decision-making autonomy, improve error recovery, enable self-prioritization',
  },
  {
    id: 'value',
    name: '💰 Value Generation & Delivery',
    priority: 'CRITICAL',
    description: 'Measurable output and business impact from autonomous work',
    improvement: 'Increase task velocity, ensure production-ready output, measure ROI',
  },
  {
    id: 'organization',
    name: '🏗️ Organization & Structure',
    priority: 'HIGH',
    description: 'Clear hierarchy, roles, and coordination between agents',
    improvement: 'Expand agent team, specialize roles, improve inter-agent coordination',
  },
  {
    id: 'scale',
    name: '📈 Scalability & Growth',
    priority: 'HIGH',
    description: 'Ability to grow team and workload without proportional cost increase',
    improvement: 'Automate onboarding, improve resource utilization, enable pay-per-use',
  },
  {
    id: 'reliability',
    name: '🛡️ Reliability & Resilience',
    priority: 'HIGH',
    description: 'System stability, uptime, and ability to handle failures gracefully',
    improvement: 'Add monitoring, implement auto-recovery, improve data persistence',
  },
  {
    id: 'human',
    name: '👤 Human-AI Collaboration',
    priority: 'MEDIUM',
    description: 'Effective partnership between humans and AI agents',
    improvement: 'Improve transparency, enable feedback loops, strengthen decision authority clarity',
  },
];

// Helper: read most recent assessment
function getMostRecentAssessment() {
  const historyFile = path.join(WORKSPACE, '.gap-analysis-history.json');
  
  if (!fs.existsSync(historyFile)) {
    return null;
  }
  
  const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
  
  if (!history.assessments || history.assessments.length === 0) {
    return null;
  }
  
  return history.assessments[0]; // Most recent is first
}

// Helper: calculate assessment age and confidence
function getAssessmentConfidence(assessment) {
  if (!assessment) return { daysOld: Infinity, level: 'NONE', emoji: '❌' };
  
  const created = new Date(assessment.timestamp);
  const now = new Date();
  const daysOld = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  
  let level, emoji;
  if (daysOld <= 7) {
    level = 'HIGH';
    emoji = '🟢';
  } else if (daysOld <= 14) {
    level = 'MODERATE';
    emoji = '🟡';
  } else {
    level = 'LOW';
    emoji = '🔴';
  }
  
  return { daysOld, level, emoji };
}

// Main review function
function runDailyReview() {
  console.log('\n' + '═'.repeat(60));
  console.log('  📊 DAILY GAP ANALYSIS REVIEW');
  console.log('═'.repeat(60));
  console.log(`\nMission: "${MISSION}"\n`);

  // Load most recent assessment
  const assessment = getMostRecentAssessment();
  const confidence = getAssessmentConfidence(assessment);
  
  let grades = {};
  let assessmentName = 'No Assessment Found';
  let assessmentDate = 'Never';
  
  if (assessment) {
    grades = assessment.grades || {};
    assessmentName = assessment.name || 'Unknown Assessment';
    assessmentDate = assessment.date || assessment.timestamp;
    console.log(`📋 Latest Assessment: "${assessmentName}" (${assessmentDate})`);
    console.log(`${confidence.emoji} Confidence: ${confidence.level} (${confidence.daysOld} days old)\n`);
    
    if (confidence.daysOld > 14) {
      console.log('⚠️  WARNING: Assessment is stale (>14 days). Consider doing a fresh assessment.\n');
    } else if (confidence.daysOld > 7) {
      console.log('💡 TIP: Assessment is aging. Plan to update within the next few days.\n');
    }
  } else {
    console.log('⚠️  No saved assessments found. Using default scores (all "In Progress").\n');
  }

  // Map assessment item IDs to swimlanes
  const itemToSwimlaneLane = {
    'a1': 'autonomy', 'a2': 'autonomy', 'a3': 'autonomy',
    'o1': 'organization', 'o2': 'organization', 'o3': 'organization',
    'v1': 'value', 'v2': 'value', 'v3': 'value',
    's1': 'scale', 's2': 'scale', 's3': 'scale',
    'r1': 'reliability', 'r2': 'reliability', 'r3': 'reliability',
    'h1': 'human', 'h2': 'human', 'h3': 'human',
  };

  // Calculate average score per swimlane from individual grades
  const swimlaneScores = SWIMLANES.map(lane => {
    // Find all items for this swimlane
    const itemIds = Object.keys(itemToSwimlaneLane).filter(
      id => itemToSwimlaneLane[id] === lane.id
    );
    
    // Get grades for these items
    const itemGrades = itemIds
      .map(id => grades[id])
      .filter(g => g !== undefined);
    
    // Calculate average, or default to 3
    let laneScore = 3;
    if (itemGrades.length > 0) {
      laneScore = Math.round(
        itemGrades.reduce((a, b) => a + b, 0) / itemGrades.length * 10
      ) / 10;
    }
    
    return {
      ...lane,
      score: laneScore,
      scoreLabel: getScoreLabel(Math.round(laneScore)),
    };
  });

  // Sort by priority, then by score (lowest scores first = biggest gaps)
  const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
  swimlaneScores.sort((a, b) => {
    const priDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priDiff !== 0) return priDiff;
    return a.score - b.score;
  });

  // Display all swimlanes
  console.log('📋 ASSESSMENT STATUS:');
  console.log('─'.repeat(60));
  swimlaneScores.forEach(lane => {
    const healthEmoji = lane.score >= 4 ? '✅' : lane.score >= 3 ? '⚠️ ' : '🔴';
    console.log(`${healthEmoji} ${lane.name}`);
    console.log(`   Priority: ${lane.priority} | Score: ${lane.score}/5 (${lane.scoreLabel})`);
  });

  // Identify top improvement target
  const topTarget = swimlaneScores[0];
  console.log('\n' + '═'.repeat(60));
  console.log('🎯 TODAY\'S FOCUS:');
  console.log('═'.repeat(60));
  console.log(`\n${topTarget.name}`);
  console.log(`Priority: ${topTarget.priority}`);
  console.log(`Current Score: ${topTarget.score}/5 (${topTarget.scoreLabel})`);
  console.log(`Description: ${topTarget.description}`);
  console.log(`\n📝 Focus Area:\n${topTarget.improvement}`);

  // Log to daily memory
  logToDailyMemory(topTarget, swimlaneScores);

  // Create recommendation
  console.log('\n' + '═'.repeat(60));
  console.log('💡 RECOMMENDATION:');
  console.log('═'.repeat(60));
  console.log(`\nFocus efforts today on improving: ${topTarget.name}`);
  console.log(`Work toward: ${topTarget.improvement}`);

  if (topTarget.score === 1) {
    console.log('\n⚠️  CRITICAL: This area is not started. Begin planning & design.');
  } else if (topTarget.score === 2) {
    console.log('\n⚠️  MAJOR GAP: This area needs active development.');
  } else if (topTarget.score === 3) {
    console.log('\n🔧 IN PROGRESS: Continue current work, aim for completeness.');
  } else if (topTarget.score === 4) {
    console.log('\n✨ NEARLY THERE: Polish and refinement phase.');
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅ Daily review complete.\n');

  return {
    timestamp: new Date().toISOString(),
    topTarget: topTarget.id,
    topTargetName: topTarget.name,
    topTargetScore: topTarget.score,
    allScores: swimlaneScores.map(s => ({
      id: s.id,
      name: s.name,
      score: s.score,
      priority: s.priority,
    })),
  };
}

// Helper: map score (1-5) to label
function getScoreLabel(score) {
  const labels = {
    1: 'Not Started',
    2: 'Early Stage',
    3: 'In Progress',
    4: 'Nearly Complete',
    5: 'Fully Achieved',
  };
  return labels[score] || 'Unknown';
}

// Helper: log to daily memory
function logToDailyMemory(topTarget, allScores) {
  const dailyFile = getDailyMemoryPath();
  
  let content = '';
  
  // Check if file exists and read it
  if (fs.existsSync(dailyFile)) {
    content = fs.readFileSync(dailyFile, 'utf8');
  }
  
  // Append gap analysis review section
  const reviewSection = `\n## 📊 Daily Gap Analysis Review (${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })})\n\n`;
  const topTargetSection = `**Today's Focus:** ${topTarget.name} (Score: ${topTarget.score}/5 - ${getScoreLabel(topTarget.score)})\n\n`;
  const recommendationSection = `**Recommendation:** ${topTarget.improvement}\n\n`;
  
  const scoresTable = `**All Swimlane Scores:**\n${allScores.map(s => `- ${s.name}: ${s.score}/5 (${s.priority})`).join('\n')}\n`;
  
  const newContent = content + reviewSection + topTargetSection + recommendationSection + scoresTable;
  
  fs.writeFileSync(dailyFile, newContent);
}

// Run the review
try {
  const result = runDailyReview();
  process.exit(0);
} catch (err) {
  console.error('\n❌ Error running daily review:', err.message);
  process.exit(1);
}
