#!/usr/bin/env node

/**
 * Hyperscaler Update - Daily Briefing Generator (UPDATED)
 * Generates daily hyperscaler briefings with VERIFIED links
 * Uses Brave Search API + link validation
 * Usage: node briefing-generator.js [--date YYYY-MM-DD] [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const CONFIG = {
  outputDir: path.join(__dirname, '..', '..', 'briefings'),
  logFile: path.join(__dirname, '..', '..', 'briefings', 'generator.log'),
  braveApiKey: process.env.BRAVE_SEARCH_API_KEY || 'BSAHJ3Wmk1IbHNqEsACADrcFLfW5eLc',
  requestTimeout: 10000,
  searchQueries: {
    'Data Center Construction': [
      'data center construction announcement 2026',
      'hyperscaler facility expansion news',
      'data center development permit',
    ],
    'Fiber Deployment': [
      'fiber optic deployment announcement 2026',
      'undersea cable construction',
      'fiber infrastructure investment',
    ],
  },
  minValidArticles: 5,
};

class BriefingGenerator {
  constructor(date = null) {
    this.date = date ? new Date(date) : new Date();
    this.dateStr = this.date.toISOString().split('T')[0];
    this.articles = [];
    this.logs = [];
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level}] ${message}`;
    this.logs.push(logLine);
    console.log(logLine);
  }

  /**
   * Search using Brave API
   */
  async braveSearch(query) {
    return new Promise((resolve, reject) => {
      const url = new URL('https://api.search.brave.com/res/v1/web/search');
      url.searchParams.append('q', query);
      url.searchParams.append('count', 10);

      const options = {
        hostname: 'api.search.brave.com',
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': CONFIG.braveApiKey,
        },
      };

      https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject).end();
    });
  }

  /**
   * Validate that a URL actually exists
   */
  async validateUrl(url) {
    return new Promise((resolve) => {
      try {
        const urlObj = new URL(url);
        const proto = urlObj.protocol === 'https:' ? https : http;
        
        const req = proto.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 400);
        });
        
        req.on('error', () => resolve(false));
        req.setTimeout(5000, () => req.destroy());
        req.end();
      } catch (e) {
        resolve(false);
      }
    });
  }

  /**
   * Main generation flow
   */
  async generate() {
    this.log('=== HYPERSCALER BRIEFING GENERATION STARTED ===');
    this.log(`Date: ${this.dateStr}`);
    this.log(`Using Brave Search API with link validation`);

    try {
      // Search for articles
      for (const [category, queries] of Object.entries(CONFIG.searchQueries)) {
        this.log(`\nSearching: ${category}`);
        
        for (const query of queries) {
          try {
            this.log(`  → "${query}"`);
            const results = await this.braveSearch(query);

            if (results.web && results.web.results) {
              for (const result of results.web.results.slice(0, 3)) {
                // Validate URL
                const isValid = await this.validateUrl(result.url);
                
                if (isValid) {
                  this.articles.push({
                    category,
                    title: result.title,
                    description: result.description || '',
                    url: result.url,
                    source: new URL(result.url).hostname,
                    foundAt: new Date().toISOString(),
                    validated: true,
                  });
                  this.log(`    ✅ ${result.title.substring(0, 50)}...`);
                } else {
                  this.log(`    ❌ [Link dead] ${result.title.substring(0, 50)}...`);
                }
              }
            }
          } catch (err) {
            this.log(`  ⚠️  Error: ${err.message}`, 'WARN');
          }
        }
      }

      if (this.articles.length === 0) {
        this.log('⚠️ No valid articles found!', 'WARN');
        return false;
      }

      this.log(`\n✅ Found ${this.articles.length} verified articles`);

      // Save briefing data
      await this.saveBriefing();
      return true;

    } catch (error) {
      this.log(`❌ Error: ${error.message}`, 'ERROR');
      return false;
    }
  }

  /**
   * Save briefing to file
   */
  async saveBriefing() {
    // Create output directory
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Generate briefing content
    const briefing = this.formatBriefing();
    const briefingFile = path.join(CONFIG.outputDir, `briefing-${this.dateStr}.txt`);
    const jsonFile = path.join(CONFIG.outputDir, `briefing-${this.dateStr}.json`);

    fs.writeFileSync(briefingFile, briefing);
    fs.writeFileSync(jsonFile, JSON.stringify({
      date: this.dateStr,
      articleCount: this.articles.length,
      articles: this.articles,
      generatedAt: new Date().toISOString(),
    }, null, 2));

    this.log(`\n✅ Briefing saved:`);
    this.log(`   • ${briefingFile}`);
    this.log(`   • ${jsonFile}`);

    // Also save logs
    const logFile = CONFIG.logFile;
    if (!fs.existsSync(path.dirname(logFile))) {
      fs.mkdirSync(path.dirname(logFile), { recursive: true });
    }
    fs.appendFileSync(logFile, this.logs.join('\n') + '\n\n');
  }

  /**
   * Format briefing as readable text
   */
  formatBriefing() {
    let output = `═══════════════════════════════════════════════════════════════\n`;
    output += `  HYPERSCALER DAILY UPDATE - ${new Date(this.dateStr).toLocaleDateString()}\n`;
    output += `═══════════════════════════════════════════════════════════════\n\n`;

    // Group by category
    const grouped = {};
    this.articles.forEach(article => {
      if (!grouped[article.category]) grouped[article.category] = [];
      grouped[article.category].push(article);
    });

    // Format each category
    for (const [category, items] of Object.entries(grouped)) {
      output += `📰 ${category} (${items.length} articles)\n`;
      output += `${'─'.repeat(60)}\n\n`;
      
      items.forEach((article, i) => {
        output += `${i + 1}. ${article.title}\n`;
        output += `   Source: ${article.source}\n`;
        output += `   ${article.description.substring(0, 150)}\n`;
        output += `   🔗 ${article.url}\n\n`;
      });
    }

    output += `${'═'.repeat(63)}\n`;
    output += `Generated: ${new Date().toISOString()}\n`;
    output += `All links verified and active ✅\n`;

    return output;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  let date = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--date' && args[i + 1]) {
      date = args[i + 1];
    }
  }

  const generator = new BriefingGenerator(date);
  const success = await generator.generate();

  process.exit(success ? 0 : 1);
}

main();
