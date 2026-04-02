#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/timothyryan/.openclaw/workspace';
const RESEARCH_LOGS = path.join(WORKSPACE, 'research-logs');
const STAGED_DIR = path.join(WORKSPACE, 'staged-improvements');
const LOG_FILE = path.join(WORKSPACE, '.research-to-staging.log');

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function getLatestResearchReport() {
  const files = fs.readdirSync(RESEARCH_LOGS)
    .filter(f => f.endsWith('-research-report.json'))
    .sort()
    .reverse();
  
  if (!files.length) {
    log('❌ No research report found');
    return null;
  }
  
  const latest = files[0];
  const reportPath = path.join(RESEARCH_LOGS, latest);
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  return { path: reportPath, data: report, filename: latest };
}

function evaluateSafety(improvement) {
  // Pre-approved areas
  const SAFE_AREAS = [
    'autonomy',
    'agent-coordination',
    'self-improvement',
    'scalability',
    'monitoring',
    'logging'
  ];
  
  const isSafe = SAFE_AREAS.some(area => 
    improvement.area?.toLowerCase?.().includes(area) ||
    improvement.title?.toLowerCase?.().includes(area)
  );
  
  const priority = improvement.priority || 'medium';
  const isHighPriority = priority === 'high' || priority === 'critical';
  
  return {
    safe: isSafe,
    highPriority: isHighPriority,
    readyForBuild: isSafe && isHighPriority,
    reason: !isSafe ? 'Area not pre-approved' : !isHighPriority ? 'Not high priority' : 'Approved for build'
  };
}

function stageImprovement(improvement, evaluation) {
  if (!evaluation.readyForBuild) {
    log(`⏭️  Skipping: ${improvement.title} (${evaluation.reason})`);
    return null;
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `staged-${timestamp}.json`;
  const filepath = path.join(STAGED_DIR, filename);
  
  const stagedData = {
    id: `staged-${timestamp}`,
    originalReport: improvement,
    evaluation,
    stagedAt: new Date().toISOString(),
    status: 'ready-for-build',
    buildSchedule: '4:00 AM EST'
  };
  
  fs.writeFileSync(filepath, JSON.stringify(stagedData, null, 2));
  log(`✅ Staged: ${improvement.title} → ${filename}`);
  
  return stagedData;
}

async function main() {
  try {
    log('🔄 Starting research-to-staging pipeline...');
    
    // Ensure staged directory exists
    if (!fs.existsSync(STAGED_DIR)) {
      fs.mkdirSync(STAGED_DIR, { recursive: true });
      log('📁 Created staged-improvements directory');
    }
    
    const report = getLatestResearchReport();
    if (!report) {
      log('⚠️  No research report to process');
      process.exit(0);
    }
    
    log(`📖 Processing research report: ${report.filename}`);
    log(`   Topics identified: ${report.data.summary.topicsIdentified}`);
    log(`   Recommended changes: ${report.data.summary.recommendedChanges}`);
    
    // Evaluate and stage improvements
    const improvements = report.data.recommendedChanges || [];
    const staged = [];
    
    for (const improvement of improvements) {
      const evaluation = evaluateSafety(improvement);
      const stagedItem = stageImprovement(improvement, evaluation);
      if (stagedItem) staged.push(stagedItem);
    }
    
    log(`\n📊 Summary:`);
    log(`   Total recommendations: ${improvements.length}`);
    log(`   Staged for build: ${staged.length}`);
    log(`   Build time: 4:00 AM EST`);
    
    if (staged.length > 0) {
      log(`\n✨ Pipeline complete. Improvements ready for 4 AM build.`);
    } else {
      log(`\n⏸️  No improvements met build criteria. Will re-evaluate tomorrow.`);
    }
    
  } catch (err) {
    log(`❌ Error: ${err.message}`);
    process.exit(1);
  }
}

main();
