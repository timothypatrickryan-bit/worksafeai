#!/usr/bin/env node

/**
 * Research to Staging Pipeline
 * Converts nightly research findings into staged improvements
 * 
 * Called by: 4 AM build job
 * Purpose: Read research report → evaluate safety → stage work → build
 * 
 * Usage:
 *   node research-to-staging.js
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  WORKSPACE: process.env.HOME + '/.openclaw/workspace',
  RESEARCH_DIR: process.env.HOME + '/.openclaw/workspace/research-logs',
  STAGING_DIR: process.env.HOME + '/.openclaw/workspace/staged-improvements',
  BUILT_DIR: process.env.HOME + '/.openclaw/workspace/built-improvements',
  LOG_FILE: process.env.HOME + '/.openclaw/workspace/.research-staging.log'
};

// Logging
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}`;
  console.log(logEntry);
  try {
    fs.appendFileSync(CONFIG.LOG_FILE, logEntry + '\n');
  } catch (e) {
    // Silent fail
  }
}

// Get latest research report
function getLatestResearchReport() {
  try {
    if (!fs.existsSync(CONFIG.RESEARCH_DIR)) {
      log('No research directory found', 'WARN');
      return null;
    }

    const files = fs.readdirSync(CONFIG.RESEARCH_DIR)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      log('No research reports found', 'WARN');
      return null;
    }

    const latestFile = files[0];
    const data = fs.readFileSync(path.join(CONFIG.RESEARCH_DIR, latestFile), 'utf8');
    return {
      filename: latestFile,
      data: JSON.parse(data)
    };
  } catch (e) {
    log(`ERROR reading research report: ${e.message}`, 'ERROR');
    return null;
  }
}

// Evaluate safety of improvement
function evaluateSafety(recommendation) {
  const safeAreas = {
    'Autonomy': { safe: true, risk: 'low', reason: 'Internal logic improvement' },
    'Agent Coordination': { safe: true, risk: 'low', reason: 'Multi-agent patterns' },
    'Decision Making': { safe: false, risk: 'medium', reason: 'Requires testing' },
    'Self-Improvement': { safe: true, risk: 'low', reason: 'Learning loop enhancement' },
    'Scalability': { safe: true, risk: 'low', reason: 'Performance optimization' },
    'Monitoring': { safe: true, risk: 'low', reason: 'Observability improvement' }
  };

  const assessment = safeAreas[recommendation.area] || { safe: false, risk: 'unknown', reason: 'Not pre-approved' };
  
  return {
    area: recommendation.area,
    recommendation: recommendation.suggestion,
    priority: recommendation.priority,
    safe: assessment.safe,
    riskLevel: assessment.risk,
    reason: assessment.reason,
    approvedForBuild: assessment.safe && recommendation.priority === 'high'
  };
}

// Create staged improvement work
function createStagedWork(report, safeRecommendations) {
  if (!fs.existsSync(CONFIG.STAGING_DIR)) {
    fs.mkdirSync(CONFIG.STAGING_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const stagingFile = `staged-${timestamp}.json`;
  const stagingPath = path.join(CONFIG.STAGING_DIR, stagingFile);

  const stagedWork = {
    stagedAt: new Date().toISOString(),
    researchDate: report.data.date,
    improvements: safeRecommendations.map((r, idx) => ({
      id: `improvement-${idx + 1}`,
      title: `${r.area}: ${r.recommendation}`,
      area: r.area,
      recommendation: r.recommendation,
      priority: r.priority,
      safetyRating: r.riskLevel,
      approved: r.approvedForBuild,
      status: r.approvedForBuild ? 'ready-to-build' : 'review-needed',
      createdAt: new Date().toISOString(),
      buildStartedAt: null,
      completedAt: null,
      notes: r.reason
    }))
  };

  fs.writeFileSync(stagingPath, JSON.stringify(stagedWork, null, 2));
  log(`✅ Staged ${stagedWork.improvements.length} improvements: ${stagingFile}`);

  return stagedWork;
}

// Identify improvements to build now
function getReadyToBuild(stagedWork) {
  return stagedWork.improvements.filter(imp => imp.approvedForBuild);
}

// Create build manifest
function createBuildManifest(readyToBuild) {
  if (!fs.existsSync(CONFIG.STAGING_DIR)) {
    fs.mkdirSync(CONFIG.STAGING_DIR, { recursive: true });
  }

  const manifest = {
    buildId: `build-${Date.now()}`,
    scheduledFor: '04:00:00 EST',
    createdAt: new Date().toISOString(),
    improvements: readyToBuild,
    buildPlan: readyToBuild.map(imp => ({
      id: imp.id,
      phase: 1,
      tasks: [
        `Research: ${imp.area}`,
        `Design: ${imp.recommendation}`,
        `Implement: Code changes`,
        `Test: Verify safety`,
        `Deploy: Activate change`,
        `Monitor: First 24 hours`
      ],
      estimatedDuration: '15-30 minutes',
      rollback: 'Revert to previous version'
    }))
  };

  const manifestPath = path.join(CONFIG.STAGING_DIR, 'build-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  log(`✅ Build manifest created: ${readyToBuild.length} improvements ready`);

  return manifest;
}

// Main workflow
function runStagingPipeline() {
  try {
    log('🔄 Starting Research-to-Staging pipeline...');

    // 1. Get latest research
    const report = getLatestResearchReport();
    if (!report) {
      log('No research report to process', 'WARN');
      process.exit(0);
    }

    log(`📋 Processing research from ${report.data.date}`);

    // 2. Evaluate safety
    const evaluatedRecommendations = report.data.improvements.recommendations.map(rec => 
      evaluateSafety(rec)
    );

    const safeRecommendations = evaluatedRecommendations.filter(r => r.safe);
    const riskyRecommendations = evaluatedRecommendations.filter(r => !r.safe);

    log(`✅ Safe recommendations: ${safeRecommendations.length}`);
    if (riskyRecommendations.length > 0) {
      log(`⚠️ Risky recommendations (marked for review): ${riskyRecommendations.length}`);
    }

    // 3. Create staged work
    const stagedWork = createStagedWork(report, evaluatedRecommendations);

    // 4. Get ready-to-build items
    const readyToBuild = getReadyToBuild(stagedWork);
    
    // 5. Create build manifest
    if (readyToBuild.length > 0) {
      const manifest = createBuildManifest(readyToBuild);
      
      console.log('\n' + JSON.stringify({
        status: 'staged-and-ready',
        timestamp: new Date().toISOString(),
        researchDate: report.data.date,
        recommendationsEvaluated: evaluatedRecommendations.length,
        safeToImplement: safeRecommendations.length,
        readyToBuildNow: readyToBuild.length,
        buildScheduledFor: '04:00 AM EST',
        estimatedDuration: '15-30 minutes per improvement'
      }, null, 2));

      log(`✨ Pipeline complete. ${readyToBuild.length} improvements ready to build at 4 AM.`);
    } else {
      log('ℹ️ No high-priority safe improvements to build at this time', 'INFO');
      console.log('\n' + JSON.stringify({
        status: 'staged-review-needed',
        timestamp: new Date().toISOString(),
        researchDate: report.data.date,
        safeButNotHighPriority: safeRecommendations.length,
        needsReview: riskyRecommendations.length,
        message: 'Review recommendations manually or adjust safety criteria'
      }, null, 2));
    }

    process.exit(0);

  } catch (error) {
    log(`❌ ERROR: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// Run
runStagingPipeline();
