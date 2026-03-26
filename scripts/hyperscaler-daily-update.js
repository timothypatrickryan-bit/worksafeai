#!/usr/bin/env node

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

// Search queries for data center and fiber topics
const SEARCH_QUERIES = {
  'Data Center Construction': [
    'data center construction announcement 2026',
    'hyperscaler facility expansion news',
    'data center development permit filing',
    'new data center groundbreaking',
  ],
  'Fiber Deployment': [
    'fiber optic deployment announcement 2026',
    'undersea cable construction news',
    'fiber infrastructure investment',
    'broadband fiber expansion',
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
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          const articles = (result.web || []).map(item => ({
            title: item.title,
            url: item.url,
            description: item.description,
            published: item.meta_url?.match(/\d{4}-\d{2}-\d{2}/) ? item.meta_url.match(/\d{4}-\d{2}-\d{2}/)[0] : null,
          })).filter(a => a.url);
          resolve(articles);
        } catch (e) {
          logError(`Failed to parse Brave response for "${query}": ${e.message}`);
          resolve([]);
        }
      });
    }).on('error', (err) => {
      logError(`Network error searching "${query}": ${err.message}`);
      resolve([]);
    });
  });
}

async function validateUrl(url) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      https.head(url, { timeout: 5000 }, (res) => {
        resolve(res.statusCode < 400);
      }).on('error', () => resolve(false));
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

  log(`\n💬 Report ready for Telegram delivery`);
  log(`   Recipient: Tim (via @tryanz92 bot)`);
  log(`\n✅ Hyperscaler Daily Update complete!`);
}

main().catch(err => {
  logError(`Fatal error: ${err.message}`);
  process.exit(1);
});
