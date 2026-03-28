#!/usr/bin/env node

/**
 * Autonomous Work Generator
 * 
 * Scans all projects for health gaps and automatically generates work items
 * for the autonomy loop's task auto-router to assign.
 * 
 * Run: node scripts/work-generator.js
 * Integrates with: autonomy-heartbeat.js (runs every 6 hours)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = process.cwd();
const WORK_QUEUE_FILE = path.join(WORKSPACE, '.work-queue.json');
const LOG_FILE = path.join(WORKSPACE, '.work-generator.log');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PROJECTS = [
  {
    name: 'WorkSafeAI',
    path: 'apps/worksafeai',
    type: 'production',
    hasBackend: true,
    hasFrontend: true,
  },
  {
    name: 'Consensus',
    path: 'apps/consensus',
    type: 'beta',
    hasBackend: true,
    hasFrontend: true,
  },
  {
    name: 'iOS App',
    path: 'apps/ios-companion',
    type: 'development',
    hasBackend: false,
    hasFrontend: true,
  },
  {
    name: 'Pro-Tel Academy',
    path: 'apps/pro-tel-academy',
    type: 'launched',
    hasBackend: true,
    hasFrontend: true,
  },
  {
    name: 'Mission Control',
    path: 'mission-control',
    type: 'ops',
    hasBackend: true,
    hasFrontend: true,
  },
];

// ============================================================================
// LOGGING HELPERS
// ============================================================================

function log(message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}`;
  console.log(logLine);
  
  try {
    fs.appendFileSync(LOG_FILE, logLine + '\n');
  } catch (e) {
    // Ignore if log file can't be written
  }
}

// ============================================================================
// WORK ITEM GENERATION
// ============================================================================

function scanProjectHealth(project) {
  const projectPath = path.join(WORKSPACE, project.path);
  const issues = [];
  
  if (!fs.existsSync(projectPath)) {
    issues.push({
      severity: 'critical',
      issue: 'project-missing',
      description: `Project directory not found at ${project.path}`,
    });
    return issues;
  }
  
  // Check 1: README exists
  const readmePath = path.join(projectPath, 'README.md');
  if (!fs.existsSync(readmePath)) {
    issues.push({
      severity: 'high',
      issue: 'missing-readme',
      description: 'README.md not found',
      workItemType: 'documentation',
    });
  }
  
  // Check 2: Backend has test suite
  if (project.hasBackend) {
    const apiDir = path.join(projectPath, 'api');
    const testFile = path.join(apiDir, 'src', '__tests__', 'integration.test.js');
    const pkgPath = path.join(apiDir, 'package.json');
    
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const hasTest = !!(pkg.scripts && pkg.scripts.test && pkg.scripts.test !== '');
        const hasTestFiles = fs.existsSync(testFile);
        
        if (!hasTest || !hasTestFiles) {
          issues.push({
            severity: 'high',
            issue: 'missing-backend-tests',
            description: 'Backend lacks test suite (Jest + Supertest)',
            workItemType: 'testing',
            estimatedHours: 4,
          });
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }
  
  // Check 3: Frontend has test suite
  if (project.hasFrontend && project.path !== 'apps/ios-companion') {
    const webDir = path.join(projectPath, 'web');
    const pkgPath = path.join(webDir, 'package.json');
    
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const hasTest = !!(pkg.scripts && pkg.scripts.test && pkg.scripts.test !== '');
        
        if (!hasTest) {
          issues.push({
            severity: 'medium',
            issue: 'missing-frontend-tests',
            description: 'Frontend lacks test suite (Vitest + Testing Library)',
            workItemType: 'testing',
            estimatedHours: 3,
          });
        }
      } catch (e) {
        // Ignore
      }
    }
  }
  
  // Check 4: Deployment status (check for .vercel)
  const vercelDir = path.join(projectPath, '.vercel');
  if (!fs.existsSync(vercelDir) && project.type !== 'development') {
    issues.push({
      severity: 'medium',
      issue: 'not-deployed',
      description: 'Project not deployed to Vercel',
      workItemType: 'deployment',
      estimatedHours: 2,
    });
  }
  
  // Check 5: Error logs / health check
  const errorLogPath = path.join(projectPath, '.error.log');
  if (fs.existsSync(errorLogPath)) {
    const errorLog = fs.readFileSync(errorLogPath, 'utf8');
    const errorCount = errorLog.split('\n').length;
    if (errorCount > 10) {
      issues.push({
        severity: 'high',
        issue: 'unresolved-errors',
        description: `Error log has ${errorCount} entries — needs review`,
        workItemType: 'debugging',
        estimatedHours: 2,
      });
    }
  }
  
  return issues;
}

// ============================================================================
// WORK ITEM CREATION
// ============================================================================

function createWorkItem(project, issue, index) {
  const severity = issue.severity === 'critical' ? 'P0' : 
                   issue.severity === 'high' ? 'P1' : 'P2';
  
  const itemId = `WG-${new Date().toISOString().split('T')[0]}-${project.name.replace(/\s/g, '')}-${index}`;
  
  let assignmentHint = 'general';
  if (issue.workItemType === 'testing') {
    assignmentHint = 'code-quality'; // Velma
  } else if (issue.workItemType === 'documentation') {
    assignmentHint = 'writer'; // Johnny
  } else if (issue.workItemType === 'deployment') {
    assignmentHint = 'devops'; // Chief
  } else if (issue.workItemType === 'debugging') {
    assignmentHint = 'code-quality';
  }
  
  return {
    id: itemId,
    project: project.name,
    projectPath: project.path,
    priority: severity,
    type: issue.workItemType || 'improvement',
    title: issue.description,
    description: `Auto-detected gap in ${project.name}: ${issue.issue}`,
    estimatedHours: issue.estimatedHours || 2,
    assignmentHint,
    detectedAt: new Date().toISOString(),
    status: 'queued',
    autoGenerated: true,
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function generateWorkItems() {
  log('🚀 Starting work generation scan...');
  
  const allWorkItems = [];
  const scanResults = {};
  
  // Scan each project
  PROJECTS.forEach((project) => {
    log(`  📁 Scanning ${project.name}...`);
    
    const issues = scanProjectHealth(project);
    scanResults[project.name] = {
      issueCount: issues.length,
      issues: issues.map(i => i.issue),
    };
    
    // Create work item for each issue
    issues.forEach((issue, index) => {
      const workItem = createWorkItem(project, issue, index);
      allWorkItems.push(workItem);
      log(`    ⚠️ ${issue.severity}: ${issue.description}`);
    });
    
    if (issues.length === 0) {
      log(`    ✅ No issues detected`);
    }
  });
  
  // Load existing queue
  let existingQueue = [];
  try {
    if (fs.existsSync(WORK_QUEUE_FILE)) {
      existingQueue = JSON.parse(fs.readFileSync(WORK_QUEUE_FILE, 'utf8'));
    }
  } catch (e) {
    log(`⚠️ Could not read existing queue: ${e.message}`);
  }
  
  // Merge: keep existing queued/executing, add new ones
  const queued = existingQueue.filter(item => 
    item.status === 'queued' || item.status === 'executing'
  );
  const allItems = [...queued, ...allWorkItems];
  
  // Deduplicate by project + issue type (keep latest)
  const deduped = {};
  allItems.forEach(item => {
    const key = `${item.projectPath}-${item.type}`;
    if (!deduped[key] || new Date(item.detectedAt) > new Date(deduped[key].detectedAt)) {
      deduped[key] = item;
    }
  });
  
  const finalQueue = Object.values(deduped);
  
  // Sort by priority
  finalQueue.sort((a, b) => {
    const priorityMap = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
    return (priorityMap[a.priority] || 99) - (priorityMap[b.priority] || 99);
  });
  
  // Save queue
  try {
    fs.writeFileSync(WORK_QUEUE_FILE, JSON.stringify(finalQueue, null, 2));
    log(`✅ Work queue saved: ${finalQueue.length} items`);
  } catch (e) {
    log(`❌ Failed to save work queue: ${e.message}`);
    return false;
  }
  
  // Summary
  log('\n📊 SCAN RESULTS:');
  Object.entries(scanResults).forEach(([project, result]) => {
    log(`  ${project}: ${result.issueCount} issue(s)`);
  });
  
  log(`\n🎯 FINAL QUEUE: ${finalQueue.length} work item(s)`);
  finalQueue.slice(0, 5).forEach(item => {
    log(`  [${item.priority}] ${item.projectPath}: ${item.title}`);
  });
  
  if (finalQueue.length > 5) {
    log(`  ... and ${finalQueue.length - 5} more`);
  }
  
  log('\n✨ Work generation complete. Auto-router will pick these up.\n');
  
  return true;
}

// ============================================================================
// RUN
// ============================================================================

if (require.main === module) {
  try {
    generateWorkItems();
  } catch (error) {
    log(`❌ FATAL ERROR: ${error.message}`);
    log(error.stack);
    process.exit(1);
  }
}

module.exports = { generateWorkItems, scanProjectHealth };
