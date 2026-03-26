#!/usr/bin/env node

/**
 * Recraft.AI Image Generation
 * Generates professional images from text prompts
 * 
 * Usage: node generate-image.js "prompt text" [--style professional] [--size 1024x1024]
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.RECRAFT_API_KEY || '78YDUtSuux1onEDkDOJxlAAht2NqSQKILTBFgayTCpaC2d0NDibJbIXiTD0FD3DX';
const API_BASE = 'https://api.recraft.ai/v1';

// Parse command line arguments
const args = process.argv.slice(2);
const prompt = args[0];
const style = (args.find(a => a.startsWith('--style'))?.split('=')[1] || args[args.indexOf('--style') + 1]) || 'professional';
const size = (args.find(a => a.startsWith('--size'))?.split('=')[1] || args[args.indexOf('--size') + 1]) || '1024x1024';

if (!prompt) {
  console.error('Usage: node generate-image.js "prompt text" [--style professional] [--size 1024x1024]');
  process.exit(1);
}

async function generateImage(promptText, imageStyle, imageDimensions) {
  return new Promise((resolve, reject) => {
    const [width, height] = imageDimensions.split('x').map(Number);
    
    const requestBody = JSON.stringify({
      prompt: promptText,
      model: 'recraftv3',
      style: imageStyle,
      width: width,
      height: height,
      quality: 'high',
      num_inference_steps: 50
    });

    console.log(`📝 Prompt: ${promptText.substring(0, 80)}...`);
    console.log(`🎨 Style: ${imageStyle}`);
    console.log(`📐 Size: ${imageDimensions}`);
    console.log(`⏳ Generating image...\n`);

    const options = {
      hostname: 'api.recraft.ai',
      port: 443,
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
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
          
          if (response.error) {
            reject(new Error(`API Error: ${response.error.message}`));
            return;
          }

          if (response.data && response.data.length > 0) {
            const imageUrl = response.data[0].url;
            const timestamp = new Date().getTime();
            const filename = `recraft-${timestamp}.png`;
            
            console.log(`✅ Image generated successfully\n`);
            console.log(`🔗 URL: ${imageUrl}`);
            console.log(`📁 File: /tmp/${filename}`);
            
            resolve({
              success: true,
              url: imageUrl,
              filename: filename,
              timestamp: timestamp
            });
          } else {
            reject(new Error('No image data in response'));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.setTimeout(120000); // 2 minute timeout

    req.write(requestBody);
    req.end();
  });
}

// Main execution
generateImage(prompt, style, size)
  .then((result) => {
    console.log(`\n✨ Ready to use!`);
    console.log(`Download from: ${result.url}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  });
