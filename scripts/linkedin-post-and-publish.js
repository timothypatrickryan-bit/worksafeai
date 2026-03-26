#!/usr/bin/env node

/**
 * LinkedIn Post Publisher - Manual Instructions (Ready for Browser Relay)
 * 
 * This script generates instructions for posting to LinkedIn
 * Future: Will integrate with OpenClaw browser relay for full automation
 * 
 * Current Flow:
 * 1. Generate post + image ✅
 * 2. Display instructions ← you are here
 * 3. (Future) Browser relay integration for auto-posting
 * 
 * Usage: node linkedin-post-and-publish.js
 */

const fs = require('fs');
const path = require('path');
const open = require('open');

const WORKSPACE = process.env.WORKSPACE || '/Users/timothyryan/.openclaw/workspace';

// Read the generated post
const postFile = path.join(WORKSPACE, '.linkedin-current-post.json');
if (!fs.existsSync(postFile)) {
  console.error('❌ Error: .linkedin-current-post.json not found. Run linkedin-post-with-image.js first.');
  process.exit(1);
}

const postData = JSON.parse(fs.readFileSync(postFile, 'utf8'));

async function displayPostingInstructions() {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                  LINKEDIN POST - READY TO PUBLISH               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`🎯 ANGLE: ${postData.angle}`);
  console.log(`⏰ GENERATED: ${new Date(postData.generatedAt).toLocaleString()}\n`);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('POST TEXT (copy this):');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(postData.fullPost);
  console.log('\n═══════════════════════════════════════════════════════════════\n');

  console.log('🖼️  IMAGE URL (for attachment):\n');
  console.log(postData.image?.url);
  console.log('\n═══════════════════════════════════════════════════════════════\n');

  console.log('📋 QUICK POST INSTRUCTIONS:');
  console.log('────────────────────────────────────────────────────────────────');
  console.log('1. Go to LinkedIn: https://www.linkedin.com/feed/');
  console.log('2. Click "Start a post"');
  console.log('3. Copy & paste the POST TEXT above');
  console.log('4. Click 📷 (photo icon)');
  console.log('5. Choose "Post from photo URL"');
  console.log('6. Paste the IMAGE URL above');
  console.log('7. Click "Post"');
  console.log('────────────────────────────────────────────────────────────────\n');

  // Copy post text to clipboard
  try {
    const { execSync } = require('child_process');
    
    // Copy to clipboard (macOS)
    execSync(`echo "${postData.fullPost.replace(/"/g, '\\"')}" | pbcopy`);
    console.log('✅ POST TEXT copied to clipboard! (Ready to paste)');
  } catch (e) {
    console.log('⚠️  Could not copy to clipboard. Copy manually from above.');
  }

  console.log('\n🔗 Open LinkedIn now? (y/n): ');
  
  // For automation, just open LinkedIn
  console.log('Opening LinkedIn in browser...\n');
  
  try {
    await open('https://www.linkedin.com/feed/');
    console.log('✅ LinkedIn feed opened!');
    console.log('\n⏰ Waiting for you to post...\n');
  } catch (e) {
    console.log('⚠️  Could not open browser. Visit: https://www.linkedin.com/feed/');
  }

  // Log the posting action
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: 'linkedin_post_ready',
    angle: postData.angle,
    imageUrl: postData.image?.url,
    status: 'awaiting_user_post'
  };

  const logPath = path.join(WORKSPACE, '.linkedin-posts.log');
  const logLine = JSON.stringify(logEntry) + '\n';
  
  fs.appendFileSync(logPath, logLine);
}

displayPostingInstructions().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
