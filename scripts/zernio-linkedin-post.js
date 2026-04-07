#!/usr/bin/env node

/**
 * Zernio LinkedIn Post Automation
 * Posts to LinkedIn via Zernio API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ZERNIO_API_KEY = process.env.ZERNIO_API_KEY || 'sk_211156c59836adee0f77d6f9bd471ede9dfc827bb5da4aa2eae7a5acf6c0c2c6';
const ZERNIO_LINKEDIN_ACCOUNT_ID = process.env.ZERNIO_LINKEDIN_ACCOUNT_ID || '69cf1a7439fec1d579eb91c5';
const ZERNIO_API_URL = 'https://api.zernio.com';

/**
 * Post to LinkedIn via Zernio API
 */
async function postToLinkedIn(content, options = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      content: content,
      accountId: ZERNIO_LINKEDIN_ACCOUNT_ID,
      platform: 'linkedin',
      scheduledAt: options.scheduledAt || null,
      ...options
    });

    const postOptions = {
      hostname: 'api.zernio.com',
      port: 443,
      path: '/v0/posts',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ZERNIO_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 10000
    };

    const req = https.request(postOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, data: response });
          } else {
            reject(new Error(`API Error (${res.statusCode}): ${JSON.stringify(response)}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, data });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        }
      });
    });

    req.on('timeout', () => {
      req.abort();
      reject(new Error('API request timeout (10s)'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Post LinkedIn Writer generated post
 */
async function postGeneratedPost(postFilePath) {
  try {
    if (!fs.existsSync(postFilePath)) {
      throw new Error(`Post file not found: ${postFilePath}`);
    }

    const content = fs.readFileSync(postFilePath, 'utf-8');
    
    // Extract just the content (skip header)
    const lines = content.split('\n');
    const contentStart = lines.findIndex(l => l.startsWith('---\n') || l === '---') + 1;
    const postContent = lines.slice(contentStart).join('\n').trim();

    if (!postContent) {
      throw new Error('No content found in post file');
    }

    console.log('📤 Posting to LinkedIn via Zernio...');
    const result = await postToLinkedIn(postContent);
    
    console.log('✅ Posted successfully!');
    console.log(`   Post ID: ${result.data.id || 'pending'}`);
    console.log(`   Status: ${result.data.status || 'scheduled'}`);
    
    return result;
  } catch (err) {
    console.error(`❌ Failed to post: ${err.message}`);
    throw err;
  }
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (!args.length) {
    console.error('Usage: node zernio-linkedin-post.js <post-file-path>');
    console.error('Example: node zernio-linkedin-post.js .linkedin-post-2026-04-02.txt');
    process.exit(1);
  }

  try {
    await postGeneratedPost(args[0]);
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { postToLinkedIn, postGeneratedPost };
