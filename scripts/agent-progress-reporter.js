#!/usr/bin/env node
/**
 * Agent Progress Reporter
 * 
 * Agents use this to report progress back to mission control
 * Usage: reportProgress(taskId, progress, status, message, output)
 * 
 * Example:
 *   const reporter = require('./agent-progress-reporter');
 *   reporter.reportProgress('task-123', 50, 'executing', 'Halfway done!');
 *   reporter.reportProgress('task-123', 100, 'completed', 'Done!', { result: '...' });
 */

const http = require('http');

const FEEDBACK_SERVER = process.env.FEEDBACK_SERVER || 'http://localhost:8081';

/**
 * Report progress to mission control
 * 
 * @param {string} taskId - Task ID
 * @param {number} progress - Progress 0-100
 * @param {string} status - Task status (executing, completed, error)
 * @param {string} message - Optional status message
 * @param {object} output - Optional output/results
 */
function reportProgress(taskId, progress, status = 'executing', message = '', output = null) {
  const feedback = {
    taskId,
    progress: Math.max(0, Math.min(100, progress)), // Clamp 0-100
    status,
    message,
    timestamp: new Date().toISOString()
  };

  if (output) {
    feedback.output = output;
  }

  if (status === 'completed') {
    feedback.completedAt = new Date().toISOString();
    feedback.progress = 100;
  }

  // Send to feedback handler
  const data = JSON.stringify(feedback);
  
  const options = {
    hostname: new URL(FEEDBACK_SERVER).hostname,
    port: new URL(FEEDBACK_SERVER).port || 8081,
    path: '/feedback',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', chunk => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Progress reported: ${taskId} → ${progress}%`);
          resolve(JSON.parse(body));
        } else {
          console.error(`⚠️ Feedback server returned ${res.statusCode}: ${body}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error(`❌ Failed to report progress: ${err.message}`);
      // Don't reject - allow agent to continue even if feedback fails
      resolve({ warning: 'Feedback not delivered' });
    });

    req.write(data);
    req.end();
  });
}

/**
 * Simulated agent task execution with progress reporting
 * Used by agent-spawner for testing
 */
async function executeTaskWithProgress(taskId, agentName, durationMs = 5000) {
  console.log(`🚀 ${agentName} starting: ${taskId}`);
  
  await reportProgress(taskId, 15, 'executing', `${agentName} starting work...`);
  
  // Simulate work with progress updates
  const steps = [
    { progress: 25, delay: durationMs * 0.2, message: 'Analyzing requirements...' },
    { progress: 50, delay: durationMs * 0.2, message: 'Building solution...' },
    { progress: 75, delay: durationMs * 0.2, message: 'Refining output...' },
    { progress: 90, delay: durationMs * 0.2, message: 'Final review...' }
  ];

  for (const step of steps) {
    await new Promise(resolve => setTimeout(resolve, step.delay));
    await reportProgress(taskId, step.progress, 'executing', step.message);
  }

  // Mark complete
  await reportProgress(taskId, 100, 'completed', `${agentName} completed task`, {
    agent: agentName,
    completedAt: new Date().toISOString(),
    quality: 'high',
    summary: `Task completed successfully by ${agentName}`
  });

  console.log(`✅ ${agentName} completed: ${taskId}`);
}

module.exports = {
  reportProgress,
  executeTaskWithProgress
};
