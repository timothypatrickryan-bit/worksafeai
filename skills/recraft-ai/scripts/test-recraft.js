#!/usr/bin/env node

/**
 * Test Recraft.AI API Connection
 * Verifies that your API key works and API is accessible
 */

const https = require('https');

const API_KEY = process.env.RECRAFT_API_KEY || '78YDUtSuux1onEDkDOJxlAAht2NqSQKILTBFgayTCpaC2d0NDibJbIXiTD0FD3DX';

console.log('🔍 Testing Recraft.AI API Connection...\n');

// Test with a simple request
const testBody = JSON.stringify({
  prompt: 'A simple red square',
  model: 'recraftv3',
  style: 'professional',
  width: 512,
  height: 512,
  quality: 'high',
  num_inference_steps: 20
});

const options = {
  hostname: 'api.recraft.ai',
  port: 443,
  path: '/v1/images/generations',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testBody),
    'Authorization': `Bearer ${API_KEY}`
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ API Connection: SUCCESS');
        console.log(`✅ Authentication: SUCCESS`);
        console.log(`✅ Status Code: ${res.statusCode}\n`);
        console.log('🎉 Your Recraft.AI integration is ready to use!');
        console.log('\nTry generating an image:');
        console.log('  node scripts/generate-image.js "A modern data center" --style professional');
        process.exit(0);
      } else if (res.statusCode === 401) {
        console.log('❌ Authentication Failed');
        console.log('   Check your API key');
        process.exit(1);
      } else if (res.statusCode === 429) {
        console.log('⚠️  Rate Limited');
        console.log('   You have exceeded your API quota');
        process.exit(1);
      } else {
        console.log(`❌ Unexpected Status: ${res.statusCode}`);
        console.log(`Response: ${data.substring(0, 200)}`);
        process.exit(1);
      }
    } catch (e) {
      console.log('❌ Failed to parse response');
      console.log(`Error: ${e.message}`);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Connection Error');
  console.log(`Error: ${error.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  req.destroy();
  console.log('❌ Request Timeout');
  console.log('   API may be unreachable');
  process.exit(1);
});

req.setTimeout(15000); // 15 second timeout

req.write(testBody);
req.end();
