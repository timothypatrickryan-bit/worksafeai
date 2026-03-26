#!/usr/bin/env node

/**
 * Automated LinkedIn Post Publisher
 * 
 * Logs in to LinkedIn using credentials and posts the generated post + image
 * Uses Playwright for reliable automation
 * 
 * Usage: node linkedin-post-auto.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.linkedin' });

const LINKEDIN_USERNAME = process.env.LINKEDIN_USERNAME;
const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD;
const WORKSPACE = process.env.WORKSPACE || '/Users/timothyryan/.openclaw/workspace';

// Check credentials
if (!LINKEDIN_USERNAME || !LINKEDIN_PASSWORD) {
  console.error('❌ Error: LINKEDIN_USERNAME and LINKEDIN_PASSWORD not set in .env.linkedin');
  process.exit(1);
}

// Read the generated post
const postFile = path.join(WORKSPACE, '.linkedin-current-post.json');
if (!fs.existsSync(postFile)) {
  console.error('❌ Error: .linkedin-current-post.json not found. Run linkedin-post-with-image.js first.');
  process.exit(1);
}

const postData = JSON.parse(fs.readFileSync(postFile, 'utf8'));

async function postToLinkedIn() {
  let browser;
  let page;
  
  try {
    // Dynamic import of playwright
    const { chromium } = await import('playwright');
    
    console.log('🚀 Starting LinkedIn automation...\n');
    console.log(`📧 Email: ${LINKEDIN_USERNAME}`);
    console.log(`📝 Post Angle: ${postData.angle}`);
    console.log(`🖼️  Image: ${postData.image?.url ? 'Ready' : 'No image'}\n`);

    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();
    
    // Set a longer timeout for navigation
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    console.log('🌐 Opening LinkedIn...');
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle' });

    // Check if already logged in
    const urlAfterNav = page.url();
    if (urlAfterNav.includes('/feed')) {
      console.log('✅ Already logged in!');
    } else {
      console.log('🔐 Logging in...');
      
      // Enter email
      await page.fill('input[name="session_key"]', LINKEDIN_USERNAME);
      await page.fill('input[name="session_password"]', LINKEDIN_PASSWORD);
      
      // Click sign in
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle' });
      console.log('✅ Login successful!');
    }

    // Navigate to feed
    console.log('📲 Going to feed...');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'networkidle' });

    // Click "Start a post" button
    console.log('✍️  Clicking post button...');
    const postButton = await page.waitForSelector('button:has-text("Start a post")', { timeout: 10000 }).catch(() => null);
    
    if (!postButton) {
      // Try alternative selectors
      const altButtons = await page.$$('button');
      for (const btn of altButtons) {
        const text = await btn.textContent();
        if (text?.includes('Start a post') || text?.includes('Share')) {
          await btn.click();
          break;
        }
      }
    } else {
      await postButton.click();
    }

    await page.waitForTimeout(2000);

    // Click in the text area
    console.log('📄 Entering post text...');
    const textarea = await page.waitForSelector('textarea, [contenteditable="true"]', { timeout: 10000 }).catch(() => null);
    
    if (textarea) {
      await textarea.fill(postData.fullPost);
    } else {
      // Try to find and click the editor
      const editable = await page.$('[contenteditable="true"]');
      if (editable) {
        await editable.focus();
        await page.keyboard.type(postData.fullPost, { delay: 10 });
      }
    }

    await page.waitForTimeout(1000);

    // Upload image
    if (postData.image?.url) {
      console.log('🖼️  Adding image...');
      
      // Look for image upload button
      const uploadButtons = await page.$$('button');
      let foundImageButton = false;
      
      for (const btn of uploadButtons) {
        const ariaLabel = await btn.getAttribute('aria-label');
        const title = await btn.getAttribute('title');
        
        if (ariaLabel?.toLowerCase().includes('image') || 
            ariaLabel?.toLowerCase().includes('photo') ||
            title?.toLowerCase().includes('image') ||
            title?.toLowerCase().includes('photo')) {
          
          await btn.click();
          foundImageButton = true;
          break;
        }
      }

      if (foundImageButton) {
        await page.waitForTimeout(1000);
        
        // Look for URL input field
        const inputs = await page.$$('input[type="text"]');
        for (const input of inputs) {
          const placeholder = await input.getAttribute('placeholder');
          if (placeholder?.toLowerCase().includes('url') || placeholder?.toLowerCase().includes('link')) {
            await input.fill(postData.image.url);
            await input.press('Enter');
            break;
          }
        }
      }
    }

    await page.waitForTimeout(2000);

    // Click post button
    console.log('📤 Publishing post...');
    const publishButtons = await page.$$('button');
    let posted = false;
    
    for (const btn of publishButtons) {
      const text = await btn.textContent();
      if (text?.includes('Post') || text?.includes('Share')) {
        const isDisabled = await btn.getAttribute('disabled');
        if (!isDisabled) {
          await btn.click();
          posted = true;
          break;
        }
      }
    }

    if (posted) {
      console.log('✅ Post published successfully!\n');
      
      // Wait a moment and take a screenshot
      await page.waitForTimeout(3000);
      const screenshot = await page.screenshot({ path: path.join(WORKSPACE, '.linkedin-post-screenshot.png') });
      console.log('📸 Screenshot saved to .linkedin-post-screenshot.png\n');
      
      // Update post status
      postData.status = 'posted';
      postData.postedAt = new Date().toISOString();
      fs.writeFileSync(postFile, JSON.stringify(postData, null, 2));
      
      console.log('🎉 LinkedIn post automation complete!');
    } else {
      console.log('⚠️  Could not find post button. Please check LinkedIn manually.');
    }

    await browser.close();

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    
    if (browser) {
      await browser.close();
    }
    
    process.exit(1);
  }
}

postToLinkedIn();
