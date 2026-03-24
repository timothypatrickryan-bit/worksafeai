#!/usr/bin/env node

/**
 * Watch Subagent Completion
 * 
 * Monitors /projects/*/phase*/ directories for new files (indicating subagent completion).
 * When files appear, automatically updates .mission-control-state.json with progress.
 * 
 * This ensures mission control state is always in sync with actual work completion,
 * not just on heartbeat cycles.
 */

const fs = require('fs');
const path = require('path');
const { watch } = require('fs');

const WORKSPACE = process.cwd();
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');
const PROJECTS_DIR = path.join(WORKSPACE, 'projects');

// Map project directories to project IDs
function getProjectIdFromDir(dirName) {
  // dirName format: "project-XXXXXXXXX"
  return dirName;
}

// Update mission control state when files appear
function updateStateOnCompletion(projectId, phaseNum, fileCount) {
  try {
    let state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    
    // Find project and update progress
    const projectIdx = state.projects.findIndex(p => p.id === projectId);
    if (projectIdx === -1) {
      console.log(`⚠️  Project ${projectId} not found in state`);
      return;
    }
    
    const project = state.projects[projectIdx];
    
    // Calculate progress: phaseNum / totalPhases * 100
    // Assume 3 phases per project as standard
    const totalPhases = project.orchestratorPlan?.phases?.length || 3;
    const newProgress = Math.min(100, Math.round((phaseNum / totalPhases) * 100));
    
    // Update completed task count
    const newCompletedTasks = Math.min(phaseNum * 2, project.taskCount || 6); // Assume ~2 tasks per phase
    
    state.projects[projectIdx] = {
      ...project,
      progress: newProgress,
      completedTaskCount: newCompletedTasks,
      lastProgressUpdate: new Date().toISOString()
    };
    
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    console.log(`✅ [${projectId}] Updated progress: ${newProgress}% (Phase ${phaseNum}/${totalPhases})`);
    
  } catch (err) {
    console.error(`❌ Error updating state: ${err.message}`);
  }
}

// Watch projects directory for completions
function startWatching() {
  console.log(`👁️  Watching ${PROJECTS_DIR} for subagent completions...`);
  
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.log(`⚠️  Projects directory not found yet`);
    return;
  }
  
  // Watch each project directory
  try {
    fs.readdirSync(PROJECTS_DIR).forEach(projectDir => {
      const projectPath = path.join(PROJECTS_DIR, projectDir);
      
      if (!fs.statSync(projectPath).isDirectory()) return;
      
      const projectId = getProjectIdFromDir(projectDir);
      
      watch(projectPath, { recursive: true }, (eventType, filename) => {
        if (eventType === 'rename' || eventType === 'change') {
          // Check which phase directory file appeared in
          const fullPath = path.join(projectPath, filename || '');
          
          if (fullPath.includes('/phase')) {
            const phaseMatch = fullPath.match(/phase(\d+)/);
            if (phaseMatch) {
              const phaseNum = parseInt(phaseMatch[1]);
              
              // Count files in this phase
              const phaseDir = path.dirname(fullPath);
              try {
                const fileCount = fs.readdirSync(phaseDir).filter(f => 
                  !f.startsWith('.')
                ).length;
                
                if (fileCount > 0) {
                  updateStateOnCompletion(projectId, phaseNum, fileCount);
                }
              } catch (err) {
                // Directory might not exist yet
              }
            }
          }
        }
      });
    });
  } catch (err) {
    console.error(`❌ Failed to watch projects: ${err.message}`);
  }
}

// Start watching
startWatching();

// Keep process alive
console.log(`📍 Press Ctrl+C to stop watching`);
process.on('SIGINT', () => {
  console.log(`\n✋ Stopped watching for completions`);
  process.exit(0);
});
