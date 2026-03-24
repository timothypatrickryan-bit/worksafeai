#!/usr/bin/env node

/**
 * Dashboard Refresh Daemon
 * 
 * Persistent service that keeps the Unified Dashboard updated in real-time
 * - Monitors all active projects and tasks
 * - Updates state file on a regular interval (every 5 minutes)
 * - Also updates on-demand when significant events occur
 * - Calculates progress, timelines, blockers
 * - Refreshes whenever this is run (good for heartbeat integration)
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', '.mission-control-state.json');
const REFRESH_LOG = path.join(__dirname, '..', '.dashboard-refresh.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}`;
  console.log(logEntry);
  
  // Append to log file
  try {
    fs.appendFileSync(REFRESH_LOG, logEntry + '\n');
  } catch (e) {
    // Ignore log errors
  }
}

function calculateProjectProgress(project, allTasks) {
  // Get tasks for this project
  const projectTasks = (allTasks || []).filter(t => t.projectId === project.id);
  
  if (!projectTasks || projectTasks.length === 0) {
    return project.status === 'completed' ? 100 : 0;
  }
  
  const completed = projectTasks.filter(t => 
    t.status === 'completed' || t.status === 'done'
  ).length;
  
  return Math.round((completed / projectTasks.length) * 100);
}

function updateDashboard() {
  try {
    // Read current state
    const stateRaw = fs.readFileSync(STATE_FILE, 'utf-8');
    const state = JSON.parse(stateRaw);
    
    let updated = false;
    
    // Update each project with current progress
    if (state.projects && Array.isArray(state.projects)) {
      state.projects.forEach(project => {
        const oldProgress = project.progress || 0;
        const newProgress = calculateProjectProgress(project, state.tasks);
        
        if (newProgress !== oldProgress) {
          project.progress = newProgress;
          updated = true;
          log(`  📊 ${project.name}: ${oldProgress}% → ${newProgress}%`);
        }
        
        // Update lastProgressUpdate timestamp
        project.lastProgressUpdate = new Date().toISOString();
      });
    }
    
    // Count task status distribution
    let taskStats = {
      total: 0,
      completed: 0,
      inProgress: 0,
      queued: 0,
      awaiting: 0
    };
    
    if (state.tasks && Array.isArray(state.tasks)) {
      state.tasks.forEach(task => {
        taskStats.total++;
        switch (task.status) {
          case 'completed':
          case 'done':
            taskStats.completed++;
            break;
          case 'in-progress':
          case 'working':
            taskStats.inProgress++;
            break;
          case 'queued':
          case 'pending':
            taskStats.queued++;
            break;
          case 'awaiting-approval':
          case 'awaiting-review':
            taskStats.awaiting++;
            break;
        }
      });
    }
    
    // Update dashboard stats
    state.dashboardStats = {
      timestamp: new Date().toISOString(),
      taskStats,
      projectCount: (state.projects || []).length,
      activeProjects: (state.projects || []).filter(p => p.status === 'active').length,
      completedProjects: (state.projects || []).filter(p => p.status === 'completed').length,
      agentCount: (state.team?.members || []).length,
      idleAgents: (state.team?.members || []).filter(a => a.status === 'idle').length,
      workingAgents: (state.team?.members || []).filter(a => a.status === 'working').length
    };
    
    // Write back if anything changed
    if (updated || !state.dashboardStats.lastRefresh) {
      state.dashboardStats.lastRefresh = new Date().toISOString();
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
      
      log(`✅ Dashboard updated: ${taskStats.completed}/${taskStats.total} tasks complete, ${state.dashboardStats.activeProjects} active projects`);
      return true;
    } else {
      log(`ℹ️ Dashboard current (no changes needed)`);
      return false;
    }
  } catch (error) {
    log(`❌ ERROR: ${error.message}`);
    return false;
  }
}

function main() {
  log('🔄 Dashboard Refresh Daemon started');
  
  // Run initial update
  updateDashboard();
  
  // If --daemon flag passed, run periodically
  if (process.argv.includes('--daemon')) {
    log('📅 Running as daemon (updates every 5 minutes)');
    
    setInterval(() => {
      updateDashboard();
    }, 5 * 60 * 1000); // 5 minutes
    
    // Keep process alive
    process.stdin.resume();
  } else {
    log('✅ Single refresh complete. Use --daemon flag for continuous updates');
    process.exit(0);
  }
}

main();
