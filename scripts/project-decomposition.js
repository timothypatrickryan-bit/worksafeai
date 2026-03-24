#!/usr/bin/env node

/**
 * PROJECT DECOMPOSITION AUTOMATION
 * 
 * Detects active projects and immediately decomposes them into:
 * - Phases/milestones
 * - Timeline estimates
 * - Success metrics
 * - Discrete tasks
 * 
 * Runs every heartbeat as part of autonomy loop
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', '.mission-control-state.json');
const AUTONOMY_LOG = path.join(__dirname, '..', '.autonomy-log.txt');

// Load state
function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    console.error('Failed to load mission control state:', e.message);
    return null;
  }
}

// Find projects that need decomposition
function findProjectsNeedingWork(state) {
  if (!state || !state.projects) return [];
  
  return state.projects.filter(p => {
    // Skip completed projects
    if (p.status === 'completed') return false;
    
    // Project needs work if:
    // 1. Has no orchestratorPlan
    // 2. Plan is empty (no phases)
    // 3. Task count is 0 (no tasks created)
    const hasEmptyPlan = !p.orchestratorPlan || 
                        !p.orchestratorPlan.phases || 
                        p.orchestratorPlan.phases.length === 0;
    
    return hasEmptyPlan || !p.taskCount || p.taskCount === 0;
  });
}

// Log findings
function log(msg) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${msg}\n`;
  
  console.log(logEntry);
  try {
    fs.appendFileSync(AUTONOMY_LOG, logEntry);
  } catch (e) {
    console.error('Failed to write autonomy log:', e.message);
  }
}

// Check if work is already in progress for a project
function isProjectWorkInProgress(projectId) {
  // Check if there's an existing task for this project
  // Check if there's a running subagent for this project
  // Return true if work already started (don't spawn duplicate)
  
  // TODO: Query Mission Control state for existing tasks
  // TODO: Query subagents list for running agents on this project
  
  return false; // For now, assume no work in progress
}

// Main
function main() {
  log('=== PROJECT DECOMPOSITION CHECK ===');
  
  const state = loadState();
  if (!state) {
    log('ERROR: Could not load mission control state');
    process.exit(1);
  }
  
  const activeProjects = findProjectsNeedingWork(state);
  
  if (activeProjects.length === 0) {
    log('✓ All active projects have plans and tasks queued');
    process.exit(0);
  }
  
  log(`⚠️  FOUND ${activeProjects.length} PROJECT(S) NEEDING DECOMPOSITION`);
  
  activeProjects.forEach(project => {
    log(`\n📋 PROJECT: ${project.name}`);
    log(`   ID: ${project.id}`);
    log(`   Status: ${project.status}`);
    log(`   Description: ${project.description}`);
    log(`   Current tasks: ${project.taskCount || 0}`);
    
    if (!project.orchestratorPlan || !project.orchestratorPlan.phases) {
      log(`   ⚠️  NO ORCHESTRATOR PLAN - NEEDS DECOMPOSITION`);
      log(`   ACTION: Spawn PROJECT_DECOMPOSITION agent for this project`);
      log(`   Agent should: Create phases, timeline, metrics, queue tasks`);
    } else if (project.taskCount === 0) {
      log(`   ⚠️  HAS PLAN BUT NO TASKS - NEEDS TASK CREATION`);
      log(`   ACTION: Spawn TASK_CREATION agent`);
      log(`   Agent should: Convert plan phases into executable tasks`);
    } else {
      log(`   ⚠️  PARTIAL COMPLETION - MONITOR PROGRESS`);
      log(`   Progress: ${project.completedTaskCount || 0}/${project.taskCount} tasks`);
    }
  });
  
  log(`\n🤖 NEXT STEP: Spawn decomposition agents for ${activeProjects.length} project(s)`);
  log('═══════════════════════════════════════\n');
  
  process.exit(0);
}

main();
