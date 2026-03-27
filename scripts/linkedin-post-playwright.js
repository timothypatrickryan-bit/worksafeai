#!/usr/bin/env node

/**
 * LinkedIn Post Automation with Playwright
 * 
 * Uses Playwright's setInputFiles() to handle file uploads
 * Fully automated: login → post text → upload image → publish
 * 
 * Usage: node linkedin-post-playwright.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.linkedin' });

const LINKEDIN_USERNAME = process.env.LINKEDIN_USERNAME;
const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD;
const WORKSPACE = process.env.WORKSPACE || '/Users/timothyryan/.openclaw/workspace';

if (!LINKEDIN_USERNAME || !LINKEDIN_PASSWORD) {
  console.error('❌ Error: LINKEDIN_USERNAME and LINKEDIN_PASSWORD not set in .env.linkedin');
  process.exit(1);
}

// Read the generated post
const postFile = path.join(WORKSPACE, '.linkedin-current-post.json');
if (!fs.existsSync(postFile)) {
  console.error('❌ Error: .linkedin-current-post.json not found. Run linkedin-post-with-download.js first.');
  process.exit(1);
}

const postData = JSON.parse(fs.readFileSync(postFile, 'utf8'));

async function postToLinkedInWithImage() {
  let browser;
  let page;

  try {
    console.log('🚀 Starting LinkedIn Post Automation with Image Upload...\n');
    console.log(`📧 Email: ${LINKEDIN_USERNAME}`);
    console.log(`📝 Post Angle: ${postData.angle}`);
    console.log(`🖼️  Image: ${postData.image?.localPath ? 'Local file' : 'N/A'}\n`);

    // Launch browser
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();

    // Set timeouts
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    // Navigate to LinkedIn
    console.log('🌐 Opening LinkedIn...');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });

    // Check if already logged in
    const currentUrl = page.url();
    if (!currentUrl.includes('/feed')) {
      console.log('🔐 Logging in...');
      
      try {
        // Try to find and fill email field
        const emailField = await page.$('input[name="session_key"]');
        if (emailField) {
          await emailField.fill(LINKEDIN_USERNAME);
          
          // Fill password
          await page.fill('input[name="session_password"]', LINKEDIN_PASSWORD);
          
          // Click sign in button
          await page.click('button[type="submit"]');
        } else {
          console.log('⚠️  Login form not found, might be pre-logged or 2FA screen');
        }
      } catch (e) {
        console.log('⚠️  Error during login form fill, continuing...');
      }
      
      // Wait for either navigation or 2FA
      try {
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 });
        console.log('✅ Login successful!');
      } catch (e) {
        console.log('⏳ Waiting for 2FA approval...');
        
        // 2FA is required - wait for user to approve on phone
        console.log('\n⚠️  2FA REQUIRED: Check your LinkedIn app on your phone and approve the sign-in');
        console.log('⏳ Waiting up to 120 seconds...\n');
        
        try {
          await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 120000 });
          console.log('✅ 2FA approved, logged in!');
        } catch (e2) {
          console.log('⏳ Still waiting for 2FA (checking page load anyway)...');
          await page.waitForTimeout(5000);
        }
      }
    } else {
      console.log('✅ Already logged in!');
    }

    // Navigate to feed
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });

    // Click "Start a post" button
    console.log('✍️  Clicking post button...');
    await page.click('button:has-text("Start a post")');
    
    // Wait for post composer to appear
    await page.waitForSelector('div[role="dialog"]', { timeout: 10000 });
    console.log('✅ Post composer opened');

    // Type post text
    console.log('📄 Entering post text...');
    const textbox = await page.$('textarea, [contenteditable="true"]');
    if (textbox) {
      await textbox.fill(postData.fullPost);
    }
    
    await page.waitForTimeout(1000);

    // Upload image if available
    if (postData.image?.localPath && fs.existsSync(postData.image.localPath)) {
      console.log('🖼️  Uploading image...');
      
      // Find the file input element
      const fileInputHandle = await page.$('input[type="file"]');
      
      if (fileInputHandle) {
        // Use setInputFiles to set the file path
        await fileInputHandle.setInputFiles(postData.image.localPath);
        console.log(`✅ Image file set: ${postData.image.localPath}`);
        
        // Wait for image to be processed
        await page.waitForTimeout(3000);
      } else {
        console.log('⚠️  File input not found. Looking for alternate upload method...');
        
        // Try clicking media button and finding file input
        const mediaButtons = await page.$$('button');
        for (const btn of mediaButtons) {
          const ariaLabel = await btn.getAttribute('aria-label');
          if (ariaLabel?.toLowerCase().includes('media') || ariaLabel?.toLowerCase().includes('photo')) {
            await btn.click();
            await page.waitForTimeout(1000);
            
            // Try to find file input after clicking
            const fileInput = await page.$('input[type="file"]');
            if (fileInput) {
              await fileInput.setInputFiles(postData.image.localPath);
              console.log(`✅ Image uploaded via alternate method`);
              break;
            }
          }
        }
      }
    } else {
      console.log('⚠️  No local image file found or file does not exist');
    }

    await page.waitForTimeout(2000);

    // Find and click Post button
    console.log('📤 Publishing post...');
    const postButtons = await page.$$('button');
    let postClicked = false;
    
    for (const btn of postButtons) {
      const text = await btn.textContent();
      if (text?.trim().toLowerCase() === 'post') {
        const isDisabled = await btn.getAttribute('disabled');
        if (!isDisabled) {
          await btn.click();
          postClicked = true;
          console.log('✅ Post button clicked!');
          break;
        }
      }
    }

    if (!postClicked) {
      console.log('⚠️  Could not find enabled Post button');
    } else {
      // Wait for post to complete
      await page.waitForTimeout(5000);
      
      // Check for success message
      const successMsg = await page.$('text=Post published|Your post was published|Post shared');
      if (successMsg) {
        console.log('🎉 POST PUBLISHED SUCCESSFULLY!\n');
        
        // Update post status
        postData.status = 'posted';
        postData.postedAt = new Date().toISOString();
        fs.writeFileSync(postFile, JSON.stringify(postData, null, 2));
        
        // Take screenshot for verification
        await page.screenshot({ path: path.join(WORKSPACE, '.linkedin-post-success.png') });
        console.log('📸 Screenshot saved to .linkedin-post-success.png');
      } else {
        console.log('✅ Post action completed (verify on LinkedIn)\n');
      }
    }

    await browser.close();
    process.exit(0);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error.stack);
    
    if (browser) {
      await browser.close();
    }
    
    process.exit(1);
  }
}

postToLinkedInWithImage();
