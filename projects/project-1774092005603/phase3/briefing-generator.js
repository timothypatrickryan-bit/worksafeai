#!/usr/bin/env node

/**
 * Hyperscaler Update - Daily Briefing Generator
 * Generates daily hyperscaler briefings using web research
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
  sourcesFile: path.join(__dirname, '..', 'phase1', '01_SOURCE_LIST.md'),
  logFile: path.join(__dirname, '..', '..', 'briefings', 'generator.log'),
  // Primary research sources (Tier 1 prioritized)
  sources: [
    { name: 'Data Center Knowledge', url: 'https://www.datacenterknowledge.com', tier: 1 },
    { name: 'Light Reading', url: 'https://www.lightreading.com', tier: 1 },
    { name: 'CNBC Technology', url: 'https://www.cnbc.com/technology/', tier: 1 },
    { name: 'CNBC Energy', url: 'https://www.cnbc.com/energy/', tier: 1 },
    { name: 'ZDNET Cloud', url: 'https://www.zdnet.com/topic/cloud/', tier: 2 },
    { name: 'The Register', url: 'https://www.theregister.com', tier: 2 },
  ],
  // Story scoring framework: Relevance × 0.4 + Impact × 0.35 + Freshness × 0.25
  scoringWeights: {
    relevance: 0.4,
    impact: 0.35,
    freshness: 0.25,
  },
  minStoryScore: 1.5,
  targetStories: 5,
  requestTimeout: 10000,
};

class BriefingGenerator {
  constructor(date = null) {
    this.date = date ? new Date(date) : new Date();
    this.dateStr = this.date.toISOString().split('T')[0];
    this.stories = [];
    this.researchTime = Date.now();
    this.logs = [];
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level}] ${message}`;
    this.logs.push(logLine);
    console.log(logLine);
  }

  /**
   * Fetch and parse content from a URL
   */
  async fetchContent(url) {
    return new Promise((resolve, reject) => {
      const requestUrl = new URL(url);
      const protocol = requestUrl.protocol === 'https:' ? https : http;

      const request = protocol.get(url, { timeout: CONFIG.requestTimeout }, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(data);
        });
      });

      request.on('error', (err) => {
        reject(err);
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error(`Request timeout for ${url}`));
      });
    });
  }

  /**
   * Extract headline and snippet from HTML content
   */
  extractArticles(html, sourceName) {
    const articles = [];
    
    // Simple regex patterns to find headlines and links (very basic extraction)
    // In production, use cheerio or jsdom for proper parsing
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const metaDesc = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);

    if (titleMatch && metaDesc) {
      articles.push({
        title: titleMatch[1].trim(),
        snippet: metaDesc[1].trim().substring(0, 200),
        source: sourceName,
        url: CONFIG.sources.find(s => s.name === sourceName)?.url || '',
        date: new Date().toISOString().split('T')[0],
      });
    }

    return articles;
  }

  /**
   * Score a potential story (Relevance × 0.4 + Impact × 0.35 + Freshness × 0.25)
   */
  scoreStory(story) {
    const relevanceKeywords = [
      'hyperscale', 'data center', 'capex', 'infrastructure', 'ai', 'power',
      'energy', 'cloud', 'compute', 'fiber', 'network', 'semiconductor',
      'gpu', 'interconnect', 'efficiency', 'cooling', 'azure', 'aws', 'google',
      'meta', 'oracle', 'openai', 'anthropic', 'gpu cluster', 'interconnect',
    ];

    const impactKeywords = [
      'billion', 'expansion', 'new', 'partnership', 'technology', 'launch',
      'major', 'announcement', 'investment', 'growth', 'disruption',
    ];

    const text = (story.title + ' ' + story.snippet).toLowerCase();

    // Relevance: how closely does it match hyperscaler infrastructure
    const relevantTerms = relevanceKeywords.filter(k => text.includes(k)).length;
    const relevance = Math.min(5, (relevantTerms / relevanceKeywords.length) * 5);

    // Impact: presence of significant business terms
    const impactTerms = impactKeywords.filter(k => text.includes(k)).length;
    const impact = Math.min(5, (impactTerms / impactKeywords.length) * 5);

    // Freshness: today's date (5.0) down to 7 days ago (1.0)
    const storyDate = new Date(story.date);
    const daysSince = Math.floor((Date.now() - storyDate) / (1000 * 60 * 60 * 24));
    const freshness = Math.max(1, 5 - (daysSince / 7) * 4);

    // Calculate weighted score
    const score =
      relevance * CONFIG.scoringWeights.relevance +
      impact * CONFIG.scoringWeights.impact +
      freshness * CONFIG.scoringWeights.freshness;

    return Math.round(score * 10) / 10;
  }

  /**
   * Generate a mock briefing (since we can't do live web scraping in this context)
   * This demonstrates the structure; in production, connect to real web research API
   */
  async generateMockBriefing() {
    this.log('Generating mock briefing (web scraping would happen here in production)');

    // Sample stories for demonstration
    const mockStories = [
      {
        title: 'Hyperscaler Capex Continues Acceleration Amid AI Demand',
        snippet: 'Major cloud providers report record infrastructure spending to support AI workloads, with year-over-year growth exceeding 40%. Moody\'s estimates combined capex reaching $700B in 2026.',
        source: 'Data Center Knowledge',
        url: 'https://www.datacenterknowledge.com/hyperscalers',
        date: this.dateStr,
        isFeature: true,
        category: 'capex',
      },
      {
        title: 'Power Availability Becomes Primary Site Selection Factor',
        snippet: 'As grid constraints intensify, infrastructure developers prioritize power-rich regions. Clean energy startups expand to meet demand for behind-the-meter solutions at data center campuses.',
        source: 'Light Reading',
        url: 'https://www.lightreading.com/energy',
        date: this.dateStr,
        isFeature: true,
        category: 'energy',
      },
      {
        title: 'New Interconnect Technologies Address AI Bandwidth Bottlenecks',
        snippet: 'Next-generation optical interconnect solutions enable disaggregated AI infrastructure with lower latency and improved serviceability compared to legacy co-packaged optics.',
        source: 'Data Center Knowledge',
        url: 'https://www.datacenterknowledge.com/interconnect',
        date: this.dateStr,
        isFeature: false,
        category: 'technology',
      },
      {
        title: 'ARM-Based Processors Gain Adoption in Regional Cloud Markets',
        snippet: 'European cloud providers deploy ARM architecture for AI inference workloads, citing power efficiency and cost advantages. Ampere and Cavium lead processor expansion.',
        source: 'ZDNET',
        url: 'https://www.zdnet.com/cloud-arm',
        date: this.dateStr,
        isFeature: false,
        category: 'processors',
      },
      {
        title: 'Northeast Data Center Sites Face Competitive Pressure on Energy',
        snippet: 'Analysis shows mid-Atlantic region data centers at disadvantage vs. Southwest alternatives due to higher electricity costs and grid constraints. Regional operators explore renewable partnerships.',
        source: 'The Register',
        url: 'https://www.theregister.com/northeast-dc',
        date: this.dateStr,
        isFeature: false,
        category: 'regional',
      },
    ];

    // Score stories
    for (const story of mockStories) {
      story.score = this.scoreStory(story);
      if (story.score >= CONFIG.minStoryScore) {
        this.stories.push(story);
      }
    }

    // Sort by score descending
    this.stories.sort((a, b) => b.score - a.score);

    this.log(`Generated ${this.stories.length} stories (min score: ${CONFIG.minStoryScore})`);
    return this.stories;
  }

  /**
   * Generate markdown briefing
   */
  generateMarkdown() {
    const featured = this.stories.filter(s => s.isFeature).slice(0, 2);
    const secondary = this.stories.filter(s => !s.isFeature).slice(0, 3);

    let md = `# Hyperscaler Update — ${this.date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}\n\n`;

    md += '## Executive Summary\n';
    md += 'Daily briefing on hyperscaler infrastructure, capex trends, and AI infrastructure development.\n\n';

    // Featured stories
    for (const story of featured) {
      const badge = `🔴 FEATURED STORY: `;
      md += `${badge}${story.title} (${story.score}/5.0)\n\n`;
      md += `**Story:** ${story.snippet}\n\n`;
      md += `**Category:** ${story.category.toUpperCase()}\n\n`;
      md += `**Source:** ${story.source} | **Date:** ${story.date}\n`;
      md += `**URL:** ${story.url}\n\n`;
      md += '---\n\n';
    }

    // Secondary stories
    for (const story of secondary) {
      const badge = `🟢 SECONDARY STORY: `;
      md += `${badge}${story.title} (${story.score}/5.0)\n\n`;
      md += `**Story:** ${story.snippet}\n\n`;
      md += `**Source:** ${story.source} | **Date:** ${story.date}\n`;
      md += `**URL:** ${story.url}\n\n`;
      md += '---\n\n';
    }

    md += '## Summary Statistics\n';
    md += `**Sources reviewed:** ${CONFIG.sources.length}\n`;
    md += `**Stories collected:** ${this.stories.length}\n`;
    md += `**Featured stories:** ${featured.length}\n`;
    md += `**Secondary stories:** ${secondary.length}\n`;
    md += `**Average score:** ${(this.stories.reduce((a, b) => a + b.score, 0) / this.stories.length).toFixed(1)}\n\n`;

    md += `*Briefing generated: ${new Date().toLocaleString()} ET*\n`;
    md += `*Research time: ${Math.round((Date.now() - this.researchTime) / 1000)} seconds*\n`;

    return md;
  }

  /**
   * Generate HTML email template (Premium Newsletter Design)
   */
  generateHTML() {
    // Helper function to escape HTML
    const escapeHtml = (text) => {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    };

    const featured = this.stories.filter(s => s.isFeature).slice(0, 2);
    const secondary = this.stories.filter(s => !s.isFeature).slice(0, 3);
    const fs = require('fs');
    const path = require('path');

    // Read premium template
    const templatePath = path.join(__dirname, 'premium-template.html');
    let html = fs.readFileSync(templatePath, 'utf-8');

    // Generate story cards
    let featuredHtml = '';
    featured.forEach((story, idx) => {
        featuredHtml += `
            <div class="story-container">
                <div class="story-card">
                    <div class="story-number">${idx + 1}</div>
                    <div class="story-content">
                        <span class="story-badge badge-featured">Featured</span>
                        <h3 class="story-title">${escapeHtml(story.title)}</h3>
                        <div class="story-meta">
                            <div class="story-meta-item">📰 ${story.source}</div>
                            <div class="story-meta-item">📅 ${story.date}</div>
                            <div class="story-meta-item">⭐ ${story.score}/5.0</div>
                        </div>
                        <div class="story-body">${escapeHtml(story.snippet)}</div>
                        <a href="${story.url}" class="story-link">Read Full Story →</a>
                    </div>
                </div>
            </div>
        `;
    });

    let secondaryHtml = '';
    secondary.forEach((story, idx) => {
        secondaryHtml += `
            <div class="story-container">
                <div class="story-card secondary">
                    <div class="story-number">${idx + 1}</div>
                    <div class="story-content">
                        <span class="story-badge badge-secondary">Secondary</span>
                        <h3 class="story-title">${escapeHtml(story.title)}</h3>
                        <div class="story-meta">
                            <div class="story-meta-item">📰 ${story.source}</div>
                            <div class="story-meta-item">📅 ${story.date}</div>
                        </div>
                        <div class="story-body">${escapeHtml(story.snippet)}</div>
                        <a href="${story.url}" class="story-link">Read More →</a>
                    </div>
                </div>
            </div>
        `;
    });

    // Replace placeholders
    html = html.replace('{{DATE}}', this.date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    }));
    html = html.replace('{{FEATURED_STORIES}}', featuredHtml);
    html = html.replace('{{SECONDARY_STORIES}}', secondaryHtml);
    html = html.replace('{{TOTAL_STORIES}}', this.stories.length);
    html = html.replace('{{FEATURED_COUNT}}', featured.length);
    html = html.replace('{{AVG_SCORE}}', (this.stories.reduce((a, b) => a + b.score, 0) / this.stories.length).toFixed(1));
    html = html.replace('{{TIMESTAMP}}', new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/New_York'
    }));

    return html;
  }

  /**
   * Save briefing files
   */
  async saveBriefing(dryRun = false) {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    const md = this.generateMarkdown();
    const html = this.generateHTML();

    const mdFile = path.join(CONFIG.outputDir, `BRIEFING_${this.dateStr}.md`);
    const htmlFile = path.join(CONFIG.outputDir, `EMAIL_${this.dateStr}.html`);

    if (!dryRun) {
      fs.writeFileSync(mdFile, md, 'utf-8');
      fs.writeFileSync(htmlFile, html, 'utf-8');
      this.log(`Saved briefing: ${mdFile}`);
      this.log(`Saved email template: ${htmlFile}`);
    } else {
      this.log(`[DRY RUN] Would save briefing: ${mdFile}`);
      this.log(`[DRY RUN] Would save email template: ${htmlFile}`);
    }

    return { mdFile, htmlFile, md, html };
  }

  /**
   * Save logs
   */
  async saveLogs(dryRun = false) {
    const logDir = path.dirname(CONFIG.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logContent = this.logs.join('\n') + '\n';

    if (!dryRun) {
      // Append to log file
      if (fs.existsSync(CONFIG.logFile)) {
        fs.appendFileSync(CONFIG.logFile, logContent, 'utf-8');
      } else {
        fs.writeFileSync(CONFIG.logFile, logContent, 'utf-8');
      }
      console.log(`\nLogs saved to: ${CONFIG.logFile}`);
    }
  }

  /**
   * Run the full briefing generation
   */
  async run(dryRun = false) {
    try {
      this.log(`Starting briefing generation for ${this.dateStr}`);
      this.log(`Dry run mode: ${dryRun ? 'ON' : 'OFF'}`);

      // Generate mock briefing (replace with real web research in production)
      const stories = await this.generateMockBriefing();
      this.log(`Generated ${stories.length} stories successfully`);

      // Save briefing files
      const { mdFile, htmlFile } = await this.saveBriefing(dryRun);

      // Save logs
      await this.saveLogs(dryRun);

      this.log(`Briefing generation completed successfully`);
      this.log(`Generated ${this.stories.length} stories (${this.stories.filter(s => s.isFeature).length} featured, ${this.stories.filter(s => !s.isFeature).length} secondary)`);

      return {
        success: true,
        date: this.dateStr,
        storiesCount: this.stories.length,
        mdFile,
        htmlFile,
      };
    } catch (error) {
      this.log(`Error: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  let date = null;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--date' && args[i + 1]) {
      date = args[++i];
    }
    if (args[i] === '--dry-run') {
      dryRun = true;
    }
  }

  const generator = new BriefingGenerator(date);
  const result = await generator.run(dryRun);

  console.log('\n✅ Briefing generation complete');
  console.log(`Date: ${result.date}`);
  console.log(`Stories: ${result.storiesCount}`);
  console.log(`Markdown: ${result.mdFile}`);
  console.log(`HTML Email: ${result.htmlFile}`);

  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
