#!/usr/bin/env node

/**
 * LinkedIn Post Generator & Auto-Poster
 * Generates topical posts for Data Center, Telecom, and Wireless industries
 * Posts automatically via browser automation (Playwright)
 * 
 * Schedule: Tuesday, Thursday, Saturday @ 9:00 AM EST
 * Alternates: Industry Insight → Trending Topic → Industry Insight
 */

const { chromium } = require('playwright');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const LINKEDIN_EMAIL = process.env.LINKEDIN_EMAIL;
const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD;

if (!LINKEDIN_EMAIL || !LINKEDIN_PASSWORD) {
  console.error('❌ Error: LINKEDIN_EMAIL or LINKEDIN_PASSWORD not set in .env');
  process.exit(1);
}

/**
 * Determine post type based on day of week
 * Tuesday (2) → Industry Insight
 * Thursday (4) → Trending Topic
 * Saturday (6) → Industry Insight
 */
function getPostType() {
  const day = new Date().getDay();
  if (day === 2 || day === 6) return 'insight';
  if (day === 4) return 'trending';
  throw new Error('Script should only run on Tue/Thu/Sat');
}

/**
 * Generate an Industry Insight post
 */
function generateInsightPost() {
  const insights = [
    {
      title: "Edge Computing's Hidden Cost",
      content: "Edge computing is reshaping data center architecture, but nobody talks about the real cost: fragmentation.\n\nInstead of consolidating compute at scale, we're now pushing it to the edges of networks—closer to users, yes, but farther from economies of scale. Power consumption per compute unit skyrockets. Cooling becomes decentralized. Talent spreads thin.\n\nThe question isn't 'should we do edge?' It's 'which workloads actually justify the infrastructure complexity?' Because in 2026, that distinction matters more than the hype.",
    },
    {
      title: "5G Network Slicing is Here—Are You Ready?",
      content: "Network slicing isn't a buzzword anymore. It's shipping.\n\n5G's ability to create virtualized, isolated networks opens doors for enterprises that were impossible in 4G. But implementation is messy. Standards compliance is catching up. Security models are still evolving.\n\nThe carriers making money aren't the ones with the flashiest technology. They're the ones who figured out slicing actually works for their customers. That's the lesson for everyone building telecom infrastructure right now.",
    },
    {
      title: "Data Sovereignty Isn't Just Compliance—It's Competitive",
      content: "The EU's regulatory pressure on data residency is spreading. Australia's following. Canada's thinking about it.\n\nWhat looked like a compliance headache 2 years ago is now a market advantage. Companies that figured out sovereign infrastructure first aren't scrambling to retrofit it. They're selling it.\n\nIf you're building data center strategy without thinking about sovereignty requirements by region, you're building for yesterday's market.",
    },
    {
      title: "The Fiber Paradox in Rural Telecom",
      content: "Every carrier wants to deploy fiber. Every regulator subsidizes it. Everyone knows it's the future.\n\nSo why are we still seeing wireless-first strategies in rural broadband? Because fiber economics are brutal. Density matters. Maintenance is expensive. Wireless is imperfect but deployable now.\n\nThe real story isn't fiber vs wireless. It's hybrid networks that are honest about tradeoffs. That's where the future actually lives.",
    },
  ];

  return insights[Math.floor(Math.random() * insights.length)];
}

/**
 * Generate a Trending Topic post
 */
function generateTrendingPost() {
  const topics = [
    {
      title: "AWS Expands Graviton Chips to New Instance Types",
      content: "AWS just pushed Graviton into more instance families. Translation: ARM architecture is becoming table stakes in cloud infrastructure.\n\nFor data center operators, this means chip diversity isn't optional anymore. x86 dominance is fragmenting. Performance benchmarks that held for a decade are shifting.\n\nThe infrastructure builders who adapt fastest here win contracts. The ones who don't? They're explaining outdated specs to prospects.",
    },
    {
      title: "Verizon and Meta Partner on Fiber Backbone",
      content: "When hyperscalers start building their own backbone infrastructure with carriers, something's shifting.\n\nIt's not that Verizon and Meta are suddenly friends. It's that the economics of shared infrastructure became too good to ignore. Less redundancy. More optimization. Real cost savings.\n\nFor smaller players? This is the moment to think about consortium infrastructure. Solo plays are getting expensive.",
    },
    {
      title: "New FCC Rules on Data Center Energy Efficiency",
      content: "The FCC tightened efficiency standards for large data centers. Power Usage Effectiveness (PUE) targets just got harder.\n\nThis isn't theoretical. It hits operational budgets immediately. Cooling systems need upgrades. Monitoring becomes mandatory. Older facilities need retrofits.\n\nThe winners? Companies that were already obsessed with efficiency. The scrambling? Everyone else. This is a competitive advantage hardening in real time.",
    },
    {
      title: "Telecom Investors Cautious on 6G Spending",
      content: "Analyst reports this week show carrier hesitation on early 6G investments. The 5G ROI story isn't done yet.\n\nThis is healthy skepticism, not pessimism. It means resources are staying focused on 5G optimization where the actual revenue is. Pie-in-the-sky 6G spending gets the side-eye.\n\nFor infrastructure builders: solve 5G problems today. That's where the contracts live in 2026.",
    },
  ];

  return topics[Math.floor(Math.random() * topics.length)];
}

/**
 * Post to LinkedIn via browser automation
 */
async function postToLinkedIn(postContent) {
  let browser;
  try {
    console.log('🔧 Launching browser...');
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate to LinkedIn login
    console.log('📍 Navigating to LinkedIn login...');
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle' });

    // Wait for login form to appear
    console.log('⏳ Waiting for login form...');
    await page.waitForSelector('input[name="session_key"]', { timeout: 15000 });

    // Check if already logged in
    const loginForm = await page.$('input[name="session_key"]');
    if (!loginForm) {
      console.log('✅ Already logged in');
      // Go straight to feed
      await page.goto('https://www.linkedin.com/feed', { waitUntil: 'networkidle' });
    } else {
      // Login
      console.log('🔐 Logging in...');
      await page.fill('input[name="session_key"]', LINKEDIN_EMAIL);
      await page.fill('input[name="session_password"]', LINKEDIN_PASSWORD);
      
      // Click submit button
      await page.click('button[type="submit"]');
      
      // Wait for navigation to feed
      console.log('⏳ Waiting for login to complete...');
      await page.waitForURL('**/feed', { timeout: 30000 });
      console.log('✅ Login successful');
    }

    // Now on feed - open post composer
    console.log('✍️ Opening post composer...');
    
    // Wait for the "Start a post" button/input
    // Try multiple selectors as LinkedIn changes structure
    try {
      await page.waitForSelector('[data-test-id="share-box-trigger"]', { timeout: 10000 });
      await page.click('[data-test-id="share-box-trigger"]');
    } catch {
      // Alternative: click the text area directly
      console.log('Trying alternative composer selector...');
      await page.waitForSelector('div[role="textbox"][contenteditable="true"]', { timeout: 10000 });
      await page.click('div[role="textbox"][contenteditable="true"]');
    }

    // Wait for editor to open
    await page.waitForTimeout(2000);

    // Type the post content
    console.log('📝 Typing post content...');
    const fullPost = `${postContent}\n\n---\nLucy, Tim's AI Agent`;
    
    // Click in the main text area
    const textbox = await page.$('div[role="textbox"][contenteditable="true"]');
    if (textbox) {
      await textbox.click();
      await page.keyboard.type(fullPost, { delay: 10 }); // slow typing to avoid issues
    } else {
      console.error('Could not find text editor');
      return false;
    }

    // Wait a moment for content to register
    await page.waitForTimeout(1000);

    // Find and click Post button
    console.log('🚀 Clicking Post button...');
    const postButton = await page.$('button:has-text("Post")');
    if (postButton) {
      await postButton.click();
    } else {
      // Try alternative selector
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await btn.textContent();
        if (text && text.includes('Post')) {
          await btn.click();
          break;
        }
      }
    }

    // Wait for post to be published
    console.log('⏳ Waiting for post to publish...');
    await page.waitForTimeout(5000);

    console.log('✅ Post published successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error posting to LinkedIn:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const postType = getPostType();
    console.log(`\n📅 ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`);
    console.log(`📌 Post Type: ${postType === 'insight' ? 'Industry Insight' : 'Trending Topic'}\n`);

    const post = postType === 'insight' ? generateInsightPost() : generateTrendingPost();
    
    console.log(`📄 Post Title: ${post.title}`);
    console.log(`\n${post.content}\n`);

    // Post to LinkedIn
    const success = await postToLinkedIn(post.content);
    
    if (success) {
      console.log('✨ LinkedIn post automation complete!');
    } else {
      console.log('⚠️ Post failed. Check browser logs above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
