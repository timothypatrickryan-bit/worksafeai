#!/usr/bin/env node

/**
 * Inspect LinkedIn login page to find correct selectors
 */

const { chromium } = require('playwright');

async function inspectLinkedIn() {
  let browser;
  try {
    console.log('🔧 Launching browser...');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('📍 Navigating to LinkedIn login...');
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle' });

    console.log('\n🔍 Inspecting page structure...\n');

    // Get all inputs
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input fields:`);
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      console.log(`  ${i + 1}. name="${name}" id="${id}" type="${type}" placeholder="${placeholder}"`);
    }

    // Get all buttons
    const buttons = await page.locator('button').all();
    console.log(`\nFound ${buttons.length} buttons:`);
    for (let i = 0; i < Math.min(5, buttons.length); i++) {
      const btn = buttons[i];
      const text = await btn.textContent();
      const type = await btn.getAttribute('type');
      const ariaLabel = await btn.getAttribute('aria-label');
      console.log(`  ${i + 1}. type="${type}" text="${text?.trim()}" aria-label="${ariaLabel}"`);
    }

    // Try to find form
    const forms = await page.locator('form').all();
    console.log(`\nFound ${forms.length} forms`);

    console.log('\n📄 Page title:', await page.title());
    console.log('📍 Page URL:', page.url());

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

inspectLinkedIn();
