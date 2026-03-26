#!/usr/bin/env node

/**
 * Recraft.AI Image Generation Script
 * Generates images from text prompts using Recraft v4
 * 
 * Usage: node recraft-generate-image.js "your prompt here"
 */

const https = require('https');
require('dotenv').config({ path: '.env.recraft' });

const RECRAFT_API_TOKEN = process.env.RECRAFT_API_TOKEN;
const RECRAFT_API_URL = 'https://external.api.recraft.ai/v1/images/generations';

if (!RECRAFT_API_TOKEN) {
  console.error('❌ Error: RECRAFT_API_TOKEN not found in .env.recraft');
  process.exit(1);
}

async function generateImage(prompt, options = {}) {
  const {
    model = 'recraftv4',
    n = 1,
    size = '1024x1024',
    style = null
  } = options;

  const requestBody = {
    prompt,
    model,
    n,
    size
  };

  if (style) {
    requestBody.style = style;
  }

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(requestBody);

    const options = {
      hostname: 'external.api.recraft.ai',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RECRAFT_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          
          if (res.statusCode === 200) {
            resolve({
              success: true,
              data: json.data || json,
              images: (json.data || []).map(img => ({
                url: img.url,
                revised_prompt: img.revised_prompt
              }))
            });
          } else {
            resolve({
              success: false,
              status: res.statusCode,
              error: json.error || data
            });
          }
        } catch (error) {
          resolve({
            success: false,
            error: error.message,
            raw: data.slice(0, 500)
          });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Main
async function main() {
  const prompt = process.argv[2];

  if (!prompt) {
    console.log('Usage: node recraft-generate-image.js "your prompt here"');
    console.log('\nExample:');
    console.log('  node recraft-generate-image.js "Fiber optic cables glowing in blue and orange"');
    process.exit(1);
  }

  console.log('🎨 Generating image...');
  console.log(`📝 Prompt: ${prompt}`);
  console.log('');

  const result = await generateImage(prompt);

  if (result.success) {
    console.log('✅ Image generated successfully!\n');
    result.images.forEach((img, idx) => {
      console.log(`Image ${idx + 1}:`);
      console.log(`  URL: ${img.url}`);
      if (img.revised_prompt) {
        console.log(`  Revised Prompt: ${img.revised_prompt}`);
      }
      console.log('');
    });
  } else {
    console.log('❌ Error generating image:');
    console.log(JSON.stringify(result.error, null, 2));
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});

module.exports = { generateImage };
