#!/usr/bin/env node

/**
 * Mission Control Dashboard Server
 * Serves the HTML dashboard and provides state via HTTP/WebSocket
 * 
 * Usage: node dashboard-server.js
 * Open: http://localhost:8080
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = 8080;
const WORKSPACE = path.join(__dirname);
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');
const DASHBOARD_FILE = path.join(WORKSPACE, 'web', 'mission-control-dashboard.html');

// Load initial state
function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (err) {
    console.error('Error loading state:', err.message);
    return { agents: {}, projects: [], inbox: [], alerts: [], contacts: [] };
  }
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve dashboard
  if (req.url === '/' || req.url === '/dashboard') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    try {
      const html = fs.readFileSync(DASHBOARD_FILE, 'utf8');
      res.writeHead(200);
      res.end(html);
    } catch (err) {
      res.writeHead(500);
      res.end('Error loading dashboard');
    }
    return;
  }

  // API: Get current state
  if (req.url === '/api/state') {
    res.setHeader('Content-Type', 'application/json');
    const state = loadState();
    res.writeHead(200);
    res.end(JSON.stringify(state));
    return;
  }

  // 404
  res.writeHead(404);
  res.end('Not found');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('✅ WebSocket client connected');

  // Send current state
  const state = loadState();
  ws.send(JSON.stringify({
    type: 'state-update',
    payload: state
  }));

  // Send updates when state file changes
  const watchInterval = setInterval(() => {
    const newState = loadState();
    ws.send(JSON.stringify({
      type: 'state-update',
      payload: newState
    }));
  }, 5000); // Check every 5 seconds

  ws.on('close', () => {
    console.log('❌ WebSocket client disconnected');
    clearInterval(watchInterval);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Mission Control Dashboard running at http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`📡 API: http://localhost:${PORT}/api/state`);
});

server.on('error', (err) => {
  console.error('Server error:', err.message);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.close();
  process.exit(0);
});
