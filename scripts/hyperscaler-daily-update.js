#!/usr/bin/env node

// GLOBAL SAFETY: Kill entire process after 5 minutes (prevents zombie processes)
setTimeout(() => {
  console.error(`[${new Date().toISOString()}] ❌ GLOBAL TIMEOUT: Script exceeded 5 minutes. Force exiting.`);
  process.exit(1);
}, 5 * 60 * 1000);

/**
 * Hyperscaler Daily Update - Curated News on Data Center & Fiber Infrastructure
 * 
 * Runs: Daily @ 7:00 AM EST (macOS launchd)
 * Purpose: Fetch verified hyperscaler news articles with link validation
 * Output: .hyperscaler-daily-report.txt + .hyperscaler-daily-articles.json
 * 
 * Topics: Data center construction, fiber deployment, hyperscaler capex, undersea cables
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const WORKSPACE = '/Users/timothyryan/.openclaw/workspace';
const LOG_FILE = path.join(WORKSPACE, '.hyperscaler-daily.log');
const ERROR_LOG = path.join(WORKSPACE, '.hyperscaler-daily-error.log');
const REPORT_FILE = path.join(WORKSPACE, '.hyperscaler-daily-report.txt');
const ARTICLES_FILE = path.join(WORKSPACE, '.hyperscaler-daily-articles.json');

const API_KEY = process.env.BRAVE_API_KEY || 'BSAHJ3Wmk1IbHNqEsACADrcFLfW5eLc';

// Search queries optimized for Pro-Tel: Northeast Data Center Structured Cabling
const SEARCH_QUERIES = {
  'Northeast Data Center Infrastructure Projects': [
    'data center infrastructure Pennsylvania 2026',
    'data center construction New York Northeast',
    'hyperscaler facility Northeast Pennsylvania Upstate NY',
    'data center expansion Pennsylvania New York',
  ],
  'Structured Cabling & Fiber Networks': [
    'structured cabling data center installation 2026',
    'fiber optic cabling infrastructure Northeast',
    'high-density cabling systems data center',
    'low-voltage cabling distribution data center',
  ],
  'Network Infrastructure Contractors & RFPs': [
    'data center infrastructure contractor Northeast',
    'cabling installation RFP Pennsylvania',
    'network infrastructure projects New York',
    'cable contractor data center opportunities',
  ],
  'Undersea & Regional Fiber Routes': [
    'fiber optic cable landing Pennsylvania',
    'undersea cable Northeast corridor',
    'trans-Atlantic cable routes Northeast',
    'regional fiber backbone deployment',
  ],
  'Edge Data Centers & Colocation': [
    'edge data center Pennsylvania',
    'colocation facility Northeast announcement',
    'regional data center development',
    'tier 4 data center Northeast',
  ],
  'Cabling Standards & Compliance': [
    'data center cabling standards 2026',
    'fiber optic infrastructure compliance requirements',
    'structured cabling certification courses',
  ],
  'Telecom & Infrastructure Investment': [
    'telecom infrastructure investment Pennsylvania',
    'broadband infrastructure funding Northeast',
    '5G infrastructure deployment Pennsylvania',
  ],
  'Vendor Partnerships & Supplier News': [
    'data center cabling vendors partnerships',
    'fiber optic equipment suppliers Northeast',
  ],
};

function log(msg) {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] ${msg}`;
  console.log(logMsg);
  fs.appendFileSync(LOG_FILE, logMsg + '\n');
}

function logError(msg) {
  const timestamp = new Date().toISOString();
  const errMsg = `[${timestamp}] ❌ ${msg}`;
  console.error(errMsg);
  fs.appendFileSync(ERROR_LOG, errMsg + '\n');
}

async function searchBrave(query) {
  return new Promise((resolve) => {
    const params = new URLSearchParams({
      q: query,
      count: 5,
    });

    const url = `https://api.search.brave.com/res/v1/web/search?${params}`;
    const options = {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': API_KEY,
      },
      timeout: 15000, // 15 second timeout for API request
    };

    const req = https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          // Brave API returns results in multiple sections: news, web, discussions, videos
          const webResults = (result.web && result.web.results) || [];
          const newsResults = (result.news && result.news.results) || [];
          
          const articles = []
            .concat(
              webResults.map(item => ({
                title: item.title,
                url: item.url,
                description: item.description,
                published: item.age || null,
              })),
              newsResults.map(item => ({
                title: item.title,
                url: item.url,
                description: item.description,
                published: item.age || null,
              }))
            )
            .filter(a => a.url);
          resolve(articles);
        } catch (e) {
          logError(`Failed to parse Brave response for "${query}": ${e.message}`);
          resolve([]);
        }
      });
    });
    
    req.on('error', (err) => {
      logError(`Network error searching "${query}": ${err.message}`);
      resolve([]);
    });
    
    req.on('timeout', () => {
      logError(`Request timeout for "${query}" (15s exceeded)`);
      req.destroy();
      resolve([]);
    });
    
    // Hard fallback: force resolve after 20 seconds no matter what
    setTimeout(() => {
      req.destroy();
      resolve([]);
    }, 20000);
  });
}

async function validateUrl(url) {
  return new Promise((resolve) => {
    try {
      new URL(url); // Validate URL format
      const req = https.request(url, { method: 'HEAD' }, (res) => {
        resolve(res.statusCode < 400);
      });
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(false);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
      // Fallback: force resolve after 6 seconds no matter what
      setTimeout(() => resolve(false), 6000);
    } catch (e) {
      resolve(false);
    }
  });
}

async function main() {
  log('🚀 Starting Hyperscaler Daily Update...\n');

  const allArticles = [];
  const categories = {};

  for (const [category, queries] of Object.entries(SEARCH_QUERIES)) {
    log(`\n📊 Searching: ${category}`);
    categories[category] = [];

    for (const query of queries) {
      log(`  → Query: "${query}"`);
      const results = await searchBrave(query);
      
      for (const article of results) {
        // Avoid duplicates
        if (!allArticles.find(a => a.url === article.url)) {
          // Validate URL (basic check - skip if returns 404)
          const isValid = await validateUrl(article.url);
          if (isValid) {
            allArticles.push(article);
            categories[category].push(article);
            log(`    ✅ ${article.title.substring(0, 60)}...`);
          } else {
            log(`    ⚠️  Invalid link: ${article.url}`);
          }
        }
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Generate report
  log('\n📄 Generating report...');
  let report = `\
═══════════════════════════════════════════════════════════════
  HYPERSCALER DAILY UPDATE - ${new Date().toLocaleDateString()}
═══════════════════════════════════════════════════════════════

✅ Found ${allArticles.length} verified articles

`;

  for (const [category, articles] of Object.entries(categories)) {
    report += `\n📰 ${category} (${articles.length} articles)\n`;
    report += '────────────────────────────────────────────────────────\n';
    
    articles.forEach((article, i) => {
      report += `\n${i + 1}. ${article.title}\n`;
      if (article.published) report += `   Published: ${article.published}\n`;
      if (article.description) report += `   ${article.description.substring(0, 120)}...\n`;
      report += `   🔗 ${article.url}\n`;
    });
  }

  report += `\n\nGenerated: ${new Date().toISOString()}\nAll links verified and active ✅\n`;

  fs.writeFileSync(REPORT_FILE, report);
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify({ articles: allArticles, generated: new Date().toISOString() }, null, 2));

  log(`\n📧 Report ready for email delivery`);
  log(`   Recipient: tim.ryan@pro-tel.com`);
  log(`   Format: Executive HTML`);
  
  // Call email sender script (separate process)
  const { execSync } = require('child_process');
  try {
    execSync(`node ${path.join(WORKSPACE, 'scripts/hyperscaler-email-sender.js')}`, { 
      stdio: 'inherit',
      timeout: 30000 
    });
  } catch (emailErr) {
    logError(`Email delivery failed: ${emailErr.message}`);
  }
  
  log(`\n✅ Hyperscaler Daily Update complete!`);
}

main().catch(err => {
  logError(`Fatal error: ${err.message}`);
  process.exit(1);
});
