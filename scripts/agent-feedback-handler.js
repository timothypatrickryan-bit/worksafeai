#!/usr/bin/env node
/**
 * Agent Feedback Handler — Receives progress updates from executing agents
 * 
 * Agents send status updates → this handler updates .mission-control-state.json
 * Enables real-time progress tracking on dashboard
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const STATE_FILE = path.join(__dirname, '..', '.mission-control-state.json');
const FEEDBACK_DIR = path.join(__dirname, '..', '.agent-feedback');
const LOG_FILE = path.join(__dirname, '..', '.agent-feedback.log');

// Ensure feedback directory exists
if (!fs.existsSync(FEEDBACK_DIR)) {
  fs.mkdirSync(FEEDBACK_DIR, { recursive: true });
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (err) {
    log(`❌ ERROR reading state: ${err.message}`);
    return null;
  }
}

function writeState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    log(`❌ ERROR writing state: ${err.message}`);
  }
}

/**
 * Update task progress from agent feedback
 * Feedback format: { taskId, progress, status, message, output? }
 */
function updateTaskProgress(feedback) {
  const state = readState();
  if (!state || !state.tasks) return false;

  const task = state.tasks.find(t => t.id === feedback.taskId);
  if (!task) {
    log(`⚠️  Task ${feedback.taskId} not found in state`);
    return false;
  }

  // Update task fields
  task.progress = feedback.progress;
  task.status = feedback.status || task.status;
  task.lastUpdate = new Date().toISOString();
  
  if (feedback.message) {
    task.message = feedback.message;
  }
  
  if (feedback.output) {
    task.output = feedback.output;
  }

  if (feedback.completedAt) {
    task.completedAt = feedback.completedAt;
  }

  writeState(state);
  
  log(`✅ Updated ${task.title}: ${feedback.progress}% (${feedback.status})`);
  
  return true;
}

/**
 * HTTP Server to receive feedback from agents
 */
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // Receive feedback
  if (req.url === '/feedback' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const feedback = JSON.parse(body);
        
        // Validate feedback
        if (!feedback.taskId || feedback.progress === undefined) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing taskId or progress' }));
          return;
        }

        // Update task
        const success = updateTaskProgress(feedback);
        
        if (success) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'updated',
            taskId: feedback.taskId,
            progress: feedback.progress
          }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Task not found' }));
        }
      } catch (err) {
        log(`❌ Error parsing feedback: ${err.message}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    
    return;
  }

  // List recent feedback
  if (req.url === '/feedback/history' && req.method === 'GET') {
    try {
      const files = fs.readdirSync(FEEDBACK_DIR)
        .sort()
        .reverse()
        .slice(0, 20);
      
      const history = files.map(file => {
        const content = fs.readFileSync(path.join(FEEDBACK_DIR, file), 'utf8');
        return JSON.parse(content);
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ count: history.length, feedback: history }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.FEEDBACK_PORT || 8081;

server.listen(PORT, () => {
  log(`═══════════════════════════════════════════════════`);
  log(`📬 AGENT FEEDBACK HANDLER`);
  log(`═══════════════════════════════════════════════════`);
  log(`Listening on http://localhost:${PORT}`);
  log(``);
  log(`Agent feedback endpoints:`);
  log(`  POST /feedback — Update task progress`);
  log(`  GET /health — Health check`);
  log(`  GET /feedback/history — Recent feedback`);
  log(``);
});

// Graceful shutdown
process.on('SIGINT', () => {
  log('Shutting down feedback handler...');
  server.close(() => {
    log('✅ Feedback handler stopped');
    process.exit(0);
  });
});

module.exports = { updateTaskProgress, readState, writeState };
