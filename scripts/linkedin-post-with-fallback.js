#!/usr/bin/env node

/**
 * LinkedIn Post with Fallback Alert
 * 
 * 1. Attempts to post via browser relay
 * 2. If fails, creates an alert in Mission Control
 * 3. Logs all activity
 * 
 * Usage: node scripts/linkedin-post-with-fallback.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const WORKSPACE = path.join(__dirname, '..');
const POST_FILE = path.join(WORKSPACE, '.linkedin-current-post.json');
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');
const LOG_FILE = path.join(WORKSPACE, '.linkedin-posts.log');

/**
 * Read post
 */
function readPost() {
  if (!fs.existsSync(POST_FILE)) {
    throw new Error('Post file not found');
  }
  return JSON.parse(fs.readFileSync(POST_FILE, 'utf8'));
}

/**
 * Read mission control state
 */
function readState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { alerts: [] };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

/**
 * Write mission control state
 */
function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * Create alert in Mission Control
 */
function createAlert(post) {
  const state = readState();
  
  if (!state.alerts) state.alerts = [];
  
  const alert = {
    id: `alert-${Date.now()}-linkedin`,
    type: 'warning',
    severity: 'high',
    title: '⚠️ LinkedIn Post Failed to Post',
    description: `Post "${post.title}" was generated but failed to post to LinkedIn via browser relay. Browser relay may not be active.`,
    action: 'Activate Chrome + LinkedIn with OpenClaw Browser Relay, then manually post or re-run the automation.',
    createdAt: new Date().toISOString(),
    resolved: false,
    post: {
      title: post.title,
      type: post.type,
      content: post.fullPost
    }
  };
  
  state.alerts.unshift(alert);
  writeState(state);
  
  return alert;
}

/**
 * Log attempt
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, entry);
}

/**
 * Attempt to post via browser relay
 */
async function attemptBrowserPost() {
  return new Promise((resolve) => {
    // Try to post via browser relay with a 10-second timeout
    // If browser relay is not active, this will fail
    const timeout = setTimeout(() => {
      resolve(false); // Browser relay not available
    }, 10000);
    
    // In a real scenario, we would use OpenClaw's browser tool here
    // For now, we're simulating the attempt
    exec(
      'curl -s http://localhost:18800/health 2>/dev/null || echo "browser_relay_not_active"',
      (error, stdout) => {
        clearTimeout(timeout);
        
        if (error || stdout.includes('browser_relay_not_active')) {
          resolve(false);
        } else {
          // Browser relay is active, attempt to post
          // (In production, this would use OpenClaw browser tool to click/post)
          resolve(false); // For now, assume posting requires manual intervention
        }
      }
    );
  });
}

/**
 * Main
 */
async function main() {
  try {
    console.log('🚀 LinkedIn Post with Fallback Alert');
    
    const post = readPost();
    log(`ATTEMPTING_POST: ${post.title}`);
    
    // Try to post via browser relay
    const posted = await attemptBrowserPost();
    
    if (posted) {
      console.log('✅ Posted to LinkedIn successfully');
      log(`POSTED_SUCCESS: ${post.title}`);
    } else {
      console.log('⚠️ Browser relay not active — creating alert in Mission Control');
      
      const alert = createAlert(post);
      log(`POSTING_FAILED: ${post.title} — Alert created in Mission Control`);
      
      console.log('');
      console.log('Alert Details:');
      console.log(`  Title: ${alert.title}`);
      console.log(`  Description: ${alert.description}`);
      console.log(`  Action: ${alert.action}`);
      console.log('');
      console.log('The post is still available in .linkedin-current-post.json');
      console.log('Re-run this script after activating Chrome + LinkedIn with OpenClaw Browser Relay');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    log(`ERROR: ${error.message}`);
    process.exit(1);
  }
}

main();
