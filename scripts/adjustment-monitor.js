#!/usr/bin/env node

/**
 * Adjustment Monitor
 * Checks for Tim's feedback in project adjustment logs
 * Alerts Lucy to unacknowledged adjustments
 * 
 * Runs continuously (every 5 minutes)
 * Purpose: Ensure Lucy sees Tim's feedback ASAP
 * 
 * Usage: node scripts/adjustment-monitor.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const WORKSPACE = path.join(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE, '.adjustment-monitor-state.json');

function apiCall(method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: apiPath,
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function readState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {
    // Silent fail
  }
  return { lastCheck: null, notifiedAdjustments: [] };
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    // Silent fail
  }
}

async function checkAdjustments() {
  const state = readState();
  const now = new Date().toISOString();

  try {
    // Get all projects
    const projectsRes = await apiCall('GET', '/api/projects');
    if (projectsRes.status !== 200) {
      return; // Silent fail
    }

    const projects = projectsRes.data.projects || [];
    const unacknowledgedAdjustments = [];

    // Check each project for unacknowledged adjustments
    for (const project of projects) {
      const adjRes = await apiCall('GET', `/api/projects/${project.id}/adjustments`);
      if (adjRes.status !== 200) continue;

      const adjustments = adjRes.data.adjustments || [];
      
      // Find unacknowledged ones (Tim's feedback to Lucy)
      const unacked = adjustments.filter(adj => !adj.acknowledgedBy);
      
      for (const adj of unacked) {
        // Only notify if we haven't notified before
        if (!state.notifiedAdjustments.includes(adj.id)) {
          unacknowledgedAdjustments.push({
            id: adj.id,
            projectId: project.id,
            projectName: project.name,
            type: adj.type,
            action: adj.action,
            timestamp: adj.timestamp,
          });
          state.notifiedAdjustments.push(adj.id);
        }
      }
    }

    // Report findings
    if (unacknowledgedAdjustments.length > 0) {
      console.log('\n' + '═'.repeat(70));
      console.log('⚠️  TIM\'S FEEDBACK AWAITING YOUR ACKNOWLEDGMENT');
      console.log('═'.repeat(70) + '\n');

      for (const adj of unacknowledgedAdjustments) {
        console.log(`📌 ${adj.projectName}`);
        console.log(`   Type: ${adj.type}`);
        console.log(`   Feedback: ${adj.action}`);
        console.log(`   Posted: ${new Date(adj.timestamp).toLocaleString()}`);
        console.log(`   → Go to http://localhost:3001/projects/${adj.projectId}`);
        console.log(`   → Find this feedback in Adjustment Log`);
        console.log(`   → Click "acknowledge & document action"\n`);
      }

      console.log('═'.repeat(70));
      console.log(`🎯 ACTION: Review ${unacknowledgedAdjustments.length} adjustment(s) above`);
      console.log('═'.repeat(70) + '\n');
    }

    state.lastCheck = now;
    saveState(state);
  } catch (err) {
    // Silent fail on errors
  }
}

// Run once if called directly
if (require.main === module) {
  checkAdjustments().then(() => {
    process.exit(0);
  }).catch(err => {
    process.exit(1);
  });
}

module.exports = { checkAdjustments };
