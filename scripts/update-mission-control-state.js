#!/usr/bin/env node

/**
 * Update Mission Control state file based on completed work
 * This script syncs the .mission-control-state.json with actual project progress
 * 
 * Usage: node scripts/update-mission-control-state.js
 * 
 * Called by autonomy loop after each briefing completion
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', '.mission-control-state.json');

function updateState(updates) {
  try {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    
    // Update timestamp
    state.lastUpdate = new Date().toISOString();
    
    // Apply updates
    if (updates.tasks) {
      updates.tasks.forEach(taskUpdate => {
        const task = state.tasks.find(t => t.id === taskUpdate.id);
        if (task) {
          Object.assign(task, taskUpdate);
        }
      });
    }
    
    if (updates.projects) {
      updates.projects.forEach(projUpdate => {
        const project = state.projects.find(p => p.id === projUpdate.id);
        if (project) {
          // Calculate progress and completed tasks
          const projTasks = state.tasks.filter(t => t.projectId === projUpdate.id);
          const completedCount = projTasks.filter(t => t.status === 'completed').length;
          const executingCount = projTasks.filter(t => t.status === 'executing').length;
          
          Object.assign(project, projUpdate, {
            completedTaskCount: completedCount,
            progress: Math.round(((completedCount + executingCount / 2) / projTasks.length) * 100),
            updatedAt: new Date().toISOString(),
          });
        }
      });
    }
    
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    return { success: true, state };
  } catch (error) {
    console.error('❌ Failed to update state:', error.message);
    return { success: false, error: error.message };
  }
}

// If called directly with args
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'ios-architecture-complete') {
    const result = updateState({
      tasks: [
        { id: 'task-ios-arch-001', status: 'completed' },
      ]
    });
    console.log(result.success ? '✅ iOS Architecture marked complete' : `❌ ${result.error}`);
  } else if (args[0] === 'ios-screens-executing') {
    const result = updateState({
      tasks: [
        { id: 'task-ios-screens-001', status: 'executing' },
      ]
    });
    console.log(result.success ? '✅ iOS Screens marked executing' : `❌ ${result.error}`);
  } else if (args[0] === 'billing-complete') {
    const result = updateState({
      tasks: [
        { id: 'task-1773872410994-aqmk3a', status: 'completed', title: 'WorkSafeAI: Implement Stripe Billing Integration' },
      ]
    });
    console.log(result.success ? '✅ Billing marked complete' : `❌ ${result.error}`);
  } else if (args[0] === 'consensus-complete') {
    const result = updateState({
      tasks: [
        { id: 'task-1773872410994-kgo1xu', status: 'completed', title: 'Consensus: Add Wirecutter Home & Advanced Searchers' },
      ]
    });
    console.log(result.success ? '✅ Consensus marked complete' : `❌ ${result.error}`);
  } else {
    console.log('Usage: node scripts/update-mission-control-state.js <command>');
    console.log('Commands:');
    console.log('  ios-architecture-complete');
    console.log('  ios-screens-executing');
    console.log('  billing-complete');
    console.log('  consensus-complete');
  }
}

module.exports = { updateState };
