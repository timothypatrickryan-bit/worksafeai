#!/usr/bin/env node

/**
 * Hyperscaler Daily Update - Curated News on Data Center & Fiber Infrastructure
 * 
 * Runs: Daily @ 7:00 AM EST (macOS launchd)
 * Purpose: Fetch verified hyperscaler news articles with link validation
 * Output: .hyperscaler-daily-report.txt + .hyperscaler-daily-articles.json
 * 
 * SIMPLIFIED: Focus on reliability over feature richness
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/timothyryan/.openclaw/workspace';
const LOG_FILE = path.join(WORKSPACE, '.hyperscaler-daily.log');
const ERROR_LOG = path.join(WORKSPACE, '.hyperscaler-daily-error.log');
const REPORT_FILE = path.join(WORKSPACE, '.hyperscaler-daily-report.txt');
const ARTICLES_FILE = path.join(WORKSPACE, '.hyperscaler-daily-articles.json');

const API_KEY = process.env.BRAVE_API_KEY || 'BSAHJ3Wmk1IbHNqEsACADrcFLfW5eLc';

// Simple queries for data center + fiber news
const SEARCH_QUERIES = [
  'data center construction 2026',
  'hyperscaler expansion news',
  'fiber optic deployment 2026',
  'undersea cable installation',
  'data center infrastructure investment',
  'fiber network expansion',
];

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
  fs.appendFileSync(LOG_FILE, `[${ts}] ${msg}\n`);
}

function logError(msg) {
  const ts = new Date().toISOString();
  console.error(`[${ts}] ❌ ${msg}`);
  fs.appendFileSync(ERROR_LOG, `[${ts}] ❌ ${msg}\n`);
}

/**
 * Search Brave API for articles on a topic
 */
function searchBrave(query) {
  return new Promise((resolve) => {
    const params = new URLSearchParams({
      q: query,
      count: 5,
    });
    
    const url = `https://api.search.brave.com/res/v1/web/search?${params.toString()}`;
    const options = {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': API_KEY,
      },
      timeout: 10000,
    };

    const req = https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          // Safely extract web results
          const articles = [];
          if (result.web && Array.isArray(result.web.results)) {
            result.web.results.forEach(item => {
              if (item.title && item.url) {
                articles.push({
                  title: item.title,
                  url: item.url,
                  description: item.description || '',
                  published: item.age || null,
                });
              }
            });
          }
          
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
      logError(`Request timeout for "${query}" (10s exceeded)`);
      req.destroy();
      resolve([]);
    });

    // Force resolve after 12 seconds
    setTimeout(() => {
      try {
        req.destroy();
      } catch (e) {}
      resolve([]);
    }, 12000);
  });
}

/**
 * Validate a URL works
 */
function validateUrl(url) {
  return new Promise((resolve) => {
    try {
      new URL(url);
      const req = https.request(url, { method: 'HEAD' }, (res) => {
        resolve(res.statusCode < 400);
      });
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(false);
      });
      req.on('error', () => resolve(false));
      req.end();
      
      setTimeout(() => resolve(false), 6000);
    } catch (e) {
      resolve(false);
    }
  });
}

/**
 * Main execution
 */
async function main() {
  log('🚀 Starting Hyperscaler Daily Update...\n');
  
  let allArticles = [];
  let validArticles = [];

  // Search for each query
  for (const query of SEARCH_QUERIES) {
    log(`🔍 Searching: "${query}"`);
    const articles = await searchBrave(query);
    log(`   Found ${articles.length} article(s)`);
    allArticles = allArticles.concat(articles);
  }

  log(`\n✅ Total articles found: ${allArticles.length}`);

  // Deduplicate by URL
  const uniqueUrls = new Set();
  const deduped = allArticles.filter(a => {
    if (uniqueUrls.has(a.url)) return false;
    uniqueUrls.add(a.url);
    return true;
  });

  log(`✅ After deduplication: ${deduped.length} unique articles`);

  // Validate URLs (optional - can skip if taking too long)
  log(`\n🔗 Validating URLs...`);
  for (const article of deduped.slice(0, 10)) {
    const valid = await validateUrl(article.url);
    if (valid) {
      validArticles.push(article);
      log(`   ✅ ${article.title.substring(0, 60)}...`);
    }
  }

  log(`\n✅ Valid articles: ${validArticles.length}`);

  // Generate report
  let report = `HYPERSCALER DAILY BRIEFING
Generated: ${new Date().toISOString()}
Article Count: ${validArticles.length}
===================================

`;

  validArticles.forEach((article, i) => {
    report += `${i + 1}. ${article.title}\n`;
    report += `   URL: ${article.url}\n`;
    if (article.description) {
      report += `   Description: ${article.description.substring(0, 150)}...\n`;
    }
    report += `\n`;
  });

  // Save report
  fs.writeFileSync(REPORT_FILE, report);
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalFound: allArticles.length,
    validArticles: validArticles.length,
    articles: validArticles,
  }, null, 2));

  log(`\n📄 Report saved to ${REPORT_FILE}`);
  log(`📋 Articles saved to ${ARTICLES_FILE}`);
  log(`\n✨ Hyperscaler Daily Update complete!`);
}

// Global timeout: exit after 4 minutes
setTimeout(() => {
  logError('GLOBAL TIMEOUT: Script exceeded 4 minutes. Force exiting.');
  process.exit(1);
}, 4 * 60 * 1000);

main().then(() => {
  process.exit(0);
}).catch(err => {
  logError(`Fatal error: ${err.message}`);
  process.exit(1);
});
