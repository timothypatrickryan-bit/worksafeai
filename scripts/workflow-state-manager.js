/**
 * Workflow State Manager
 * 
 * Handles persistent state for task workflow execution
 * Tracks: task status, execution progress, checkpoints, results
 */

const fs = require('fs');
const path = require('path');

const STATE_DIR = path.join(process.env.HOME, '.openclaw/workspace/.workflow');

class WorkflowStateManager {
  constructor() {
    this.ensureStateDir();
  }

  ensureStateDir() {
    if (!fs.existsSync(STATE_DIR)) {
      fs.mkdirSync(STATE_DIR, { recursive: true });
    }
  }

  /**
   * Save execution state for a task
   */
  saveTaskExecution(taskId, execution) {
    const filename = path.join(STATE_DIR, `task-${taskId}.json`);
    fs.writeFileSync(filename, JSON.stringify(execution, null, 2), 'utf8');
  }

  /**
   * Load execution state for a task
   */
  loadTaskExecution(taskId) {
    const filename = path.join(STATE_DIR, `task-${taskId}.json`);
    try {
      if (fs.existsSync(filename)) {
        return JSON.parse(fs.readFileSync(filename, 'utf8'));
      }
    } catch (err) {
      console.error(`Error loading execution state for ${taskId}:`, err.message);
    }
    return null;
  }

  /**
   * Add checkpoint to task execution
   */
  addCheckpoint(taskId, checkpoint) {
    const execution = this.loadTaskExecution(taskId) || { checkpoints: [] };
    execution.checkpoints.push({
      ...checkpoint,
      timestamp: new Date().toISOString()
    });
    this.saveTaskExecution(taskId, execution);
  }

  /**
   * Mark task execution as completed
   */
  completeTaskExecution(taskId, result) {
    const execution = this.loadTaskExecution(taskId) || {};
    execution.status = 'completed';
    execution.completedAt = new Date().toISOString();
    execution.result = result;
    this.saveTaskExecution(taskId, execution);
  }

  /**
   * Mark task execution as failed
   */
  failTaskExecution(taskId, error) {
    const execution = this.loadTaskExecution(taskId) || {};
    execution.status = 'failed';
    execution.failedAt = new Date().toISOString();
    execution.error = {
      message: error.message,
      stack: error.stack
    };
    this.saveTaskExecution(taskId, execution);
  }

  /**
   * Get all executions
   */
  getAllExecutions() {
    const files = fs.readdirSync(STATE_DIR);
    const executions = [];
    
    files.forEach(file => {
      if (file.startsWith('task-') && file.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(STATE_DIR, file), 'utf8'));
          executions.push(data);
        } catch (err) {
          console.error(`Error loading ${file}:`, err.message);
        }
      }
    });

    return executions;
  }

  /**
   * Get execution stats
   */
  getStats() {
    const executions = this.getAllExecutions();
    return {
      total: executions.length,
      completed: executions.filter(e => e.status === 'completed').length,
      inProgress: executions.filter(e => e.status === 'in-progress').length,
      failed: executions.filter(e => e.status === 'failed').length,
      pending: executions.filter(e => e.status === 'pending').length
    };
  }
}

module.exports = WorkflowStateManager;
