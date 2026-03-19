#!/usr/bin/env node

/**
 * LinkedIn Post Debug Version
 * Shows screen during login for troubleshooting
 */

const { chromium } = require('playwright');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const LINKEDIN_EMAIL = process.env.LINKEDIN_EMAIL;
const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD;

async function main() {
  let browser;
  try {
    console.log('🔧 Launching browser (visible)...');
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Set viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('📍 Navigating to LinkedIn login...');
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle' });

    console.log('⏳ Waiting for login form...');
    await page.waitForSelector('input[name="session_key"]', { timeout: 15000 });

    console.log('\n👀 LOOK AT BROWSER - Login form is visible');
    console.log('⏳ Will login in 5 seconds...\n');
    await page.waitForTimeout(5000);

    console.log('🔐 Entering credentials...');
    await page.fill('input[name="session_key"]', LINKEDIN_EMAIL);
    await page.fill('input[name="session_password"]', LINKEDIN_PASSWORD);

    console.log('📝 Credentials filled - submitting...');
    await page.click('button[type="submit"]');

    console.log('⏳ Waiting for navigation (checking for 2FA or feed)...');
    
    // Wait up to 60 seconds, checking for different outcomes
    const navigationPromise = page.waitForURL('**/feed', { timeout: 60000 }).catch(() => 'timeout');
    const twoFAPromise = page.waitForSelector('[data-test-id="security-challenge-action"]', { timeout: 60000 }).catch(() => 'no-2fa');

    const result = await Promise.race([navigationPromise, twoFAPromise]);

    if (result === 'timeout') {
      console.log('❌ Navigation timeout - likely 2FA required');
      console.log('📸 Taking screenshot to see current state...');
      await page.screenshot({ path: '/tmp/linkedin-debug.png' });
      console.log('📸 Screenshot saved to /tmp/linkedin-debug.png');
      console.log('👀 Please check the browser window for prompts (2FA, security check, etc.)');
      console.log('⏳ Browser will stay open for 60 more seconds...');
      await page.waitForTimeout(60000);
    } else if (result !== 'no-2fa') {
      console.log('✅ Successfully navigated to feed!');
    } else {
      console.log('⚠️ Possible 2FA or security challenge');
      console.log('👀 Please complete any prompts in the browser window');
      console.log('⏳ Waiting 120 seconds for manual completion...');
      await page.waitForTimeout(120000);
    }

    console.log('\n✅ Test complete. Browser will close.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
