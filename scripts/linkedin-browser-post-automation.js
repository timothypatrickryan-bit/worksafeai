#!/usr/bin/env node

/**
 * LinkedIn Browser Post Automation
 * Posts the content from .linkedin-current-post.json to LinkedIn via browser relay
 * 
 * Usage: node linkedin-browser-post-automation.js
 * 
 * Requirements:
 * - OpenClaw browser relay active with LinkedIn tab attached
 * - Must be logged into LinkedIn already
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..');
const POST_FILE = path.join(WORKSPACE, '.linkedin-current-post.json');

/**
 * Read the prepared post
 */
function readPost() {
  if (!fs.existsSync(POST_FILE)) {
    throw new Error(`Post file not found: ${POST_FILE}`);
  }
  
  const data = fs.readFileSync(POST_FILE, 'utf8');
  return JSON.parse(data);
}

/**
 * Log the posting attempt
 */
function logPosting(post, status) {
  const timestamp = new Date().toISOString();
  const logFile = path.join(WORKSPACE, '.linkedin-posts.log');
  const entry = `[${timestamp}] ${status}: ${post.title}\n`;
  fs.appendFileSync(logFile, entry);
}

/**
 * Main
 */
async function main() {
  try {
    const post = readPost();
    
    console.log('📄 LinkedIn Post Ready');
    console.log('---');
    console.log(post.fullPost);
    console.log('---');
    console.log('');
    console.log('To post to LinkedIn:');
    console.log('1. Open LinkedIn in Chrome');
    console.log('2. Click OpenClaw Browser Relay toolbar button');
    console.log('3. Run: node scripts/linkedin-browser-post-via-relay.js');
    console.log('');
    
    // For automated posting, we would use OpenClaw's browser tool here
    // But since we need user's authenticated session, we'll prepare the post
    // and log it for the user to manually trigger
    
    logPosting(post, 'READY_TO_POST');
    
    console.log('✅ Post prepared and logged');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
