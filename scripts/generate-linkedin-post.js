#!/usr/bin/env node

/**
 * LinkedIn Writer - Autonomous Post Generator
 * Generates authentic, human-sounding LinkedIn posts 3x/week
 * Schedule: Tue/Wed/Thu @ 8-9 AM EST via launchd
 * 
 * Workflow:
 * 1. Search trending topics (Brave Search API)
 * 2. Select best topic for post
 * 3. Auto-choose format (Story, Contrarian, List, Lesson, Behind-the-Scenes)
 * 4. Generate post copy
 * 5. Add hashtags + engagement strategy
 * 6. Quality check
 * 7. Save to .linkedin-post-[date].txt
 */

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  BRAVE_API_KEY: process.env.BRAVE_API_KEY || '',
  OUTPUT_DIR: process.env.HOME + '/.openclaw/workspace',
  LOG_FILE: process.env.HOME + '/.openclaw/workspace/.linkedin-writer.log',
  TOPICS: [
    'data center construction 2026',
    'fiber optics deployment news',
    'hyperscaler expansion',
    '5G infrastructure investment',
    'network resilience',
    'AI infrastructure demand',
    'critical infrastructure funding',
    'broadband expansion projects'
  ],
  HASHTAGS: {
    core: ['#DataCenter', '#FiberOptics', '#Telecom', '#Infrastructure'],
    trending: [
      '#EdgeComputing', '#NetworkResiliency', '#Hyperscaler', '#5G',
      '#CriticalInfrastructure', '#TelecomInnovation', '#AIInfrastructure',
      '#BroadbandExpansion'
    ],
    professional: ['#ThoughtLeadership', '#IndustryInsights']
  }
};

// Logging
function log(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}`;
  console.log(logEntry);
  try {
    fs.appendFileSync(CONFIG.LOG_FILE, logEntry + '\n');
  } catch (e) {
    // Silent fail if log file not writable
  }
}

// Brave Search API
function searchBrave(query) {
  return new Promise((resolve, reject) => {
    if (!CONFIG.BRAVE_API_KEY) {
      log('ERROR: BRAVE_API_KEY not configured');
      return reject(new Error('BRAVE_API_KEY not set'));
    }

    const url = new URL('https://api.search.brave.com/res/v1/web/search');
    url.searchParams.append('q', query);
    url.searchParams.append('count', '10');

    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': CONFIG.BRAVE_API_KEY
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Pick best trending topic
async function getTrendingTopic() {
  log('🔍 Searching for trending topics...');
  
  const randomTopic = CONFIG.TOPICS[Math.floor(Math.random() * CONFIG.TOPICS.length)];
  
  try {
    const results = await searchBrave(randomTopic);
    
    if (results.web && results.web.results && results.web.results.length > 0) {
      const article = results.web.results[0];
      log(`✅ Found trending topic: "${article.title}"`);
      return {
        title: article.title,
        description: article.description || '',
        url: article.url,
        source: article.page_age || 'Recent'
      };
    }
  } catch (e) {
    log(`⚠️  Search error: ${e.message}`);
  }

  // Fallback topic if search fails
  return {
    title: 'Data Center Infrastructure Continues to Transform',
    description: 'Hyperscalers investing heavily in AI-optimized infrastructure',
    url: '#',
    source: 'Recent'
  };
}

// Determine post format based on topic
function selectFormat(topic) {
  const titleLower = topic.title.toLowerCase();
  
  // Format selection logic
  if (titleLower.includes('news') || titleLower.includes('announce') || titleLower.includes('expansion')) {
    return 'story';
  } else if (titleLower.includes('trend') || titleLower.includes('challenge') || titleLower.includes('wrong')) {
    return 'contrarian';
  } else if (titleLower.includes('why') || titleLower.includes('things') || titleLower.includes('ways')) {
    return 'list';
  } else if (titleLower.includes('learn') || titleLower.includes('lesson') || titleLower.includes('experience')) {
    return 'lesson';
  } else {
    return 'behind-the-scenes';
  }
}

// Generate post based on format
function generatePost(topic, format) {
  log(`📝 Generating ${format} post...`);
  
  const posts = {
    story: generateStoryPost,
    contrarian: generateContrarianPost,
    list: generateListPost,
    lesson: generateLessonPost,
    'behind-the-scenes': generateBehindTheScenesPost
  };

  const generator = posts[format] || generateStoryPost;
  return generator(topic);
}

function generateStoryPost(topic) {
  return `${topic.title}

I saw this news and realized something important.

Most teams think infrastructure upgrades are about capacity. "We need more bandwidth, more compute, more scale."

But that's not what's driving the wins right now.

The companies actually winning are focused on one thing: resilience.

${topic.description}

Whether it's fiber diversity, power redundancy, or geographic distribution, the winners are building for failure. Not just for growth.

Your infrastructure spend should be resilience-first. Everything else follows.

What's your biggest infrastructure challenge right now?`;
}

function generateContrarianPost(topic) {
  return `Most people think ${topic.title.toLowerCase()} is about capacity.

It's not.

The real play is resilience.

${topic.description}

Here's why this matters: capacity without redundancy is a liability. You can build all the infrastructure you want, but one failed link = darkness for your customers.

The companies rethinking their infrastructure strategy aren't optimizing for speed or capacity. They're optimizing for "what happens when something breaks?"

That mindset shift changes everything.

Do you agree, or am I missing something?`;
}

function generateListPost(topic) {
  return `Here's what the industry needs to understand about ${topic.title.toLowerCase()}:

1. Infrastructure is the constraint, not compute.

2. Redundancy matters more than capacity.

3. Regional is winning over centralized.

4. Resilience is the new efficiency.

5. One fiber cut shouldn't take down half your operation.

${topic.description}

The companies winning right now aren't building bigger. They're building smarter.

What would you add to this list?`;
}

function generateLessonPost(topic) {
  return `I used to think infrastructure was about throughput.

Then I watched what actually wins in the market.

Now I think it's about not failing when it matters most.

${topic.description}

The shift is subtle but important. Capacity matters. But resilience wins.

Every infrastructure decision should answer this question: "What happens if this fails?"

If you don't have a clear answer, you're optimizing for the wrong thing.

What changed your perspective on infrastructure?`;
}

function generateBehindTheScenesPost(topic) {
  return `Behind the scenes of most infrastructure projects: nobody's talking about the thing that actually matters.

${topic.title}

${topic.description}

But here's what nobody says out loud: capacity is easy. Resilience is hard.

You can buy more bandwidth. You can rent more servers. You can scale up compute on demand.

But if you haven't thought about what happens when a critical link fails—you're not ready.

The infrastructure decisions that look boring now will make or break your business in 3-5 years.

Are you building for capacity or for resilience?`;
}

// Select hashtags
function selectHashtags(format) {
  const core = CONFIG.HASHTAGS.core.slice(0, 3);
  const trending = CONFIG.HASHTAGS.trending.slice(0, Math.floor(Math.random() * 3) + 2);
  const professional = Math.random() > 0.5 ? [CONFIG.HASHTAGS.professional[0]] : [];
  
  return [...core, ...trending, ...professional].slice(0, 8).join(' ');
}

// Quality check
function qualityCheck(post) {
  const checks = {
    hasOpening: post.split('\n')[0].length > 20,
    hasWhitespace: post.split('\n').length > 3,
    hasEngagementHook: /\?$/.test(post.trim()),
    noBuzzwords: !/(synergy|leverage|ecosystem|disrupt|game.changer)/.test(post.toLowerCase()),
    underLength: post.length < 1500,
    hasSpecific: /(\d+|specific|real|concrete)/.test(post.toLowerCase()),
    noAllCaps: !/(MUST|URGENT|CRITICAL)/.test(post),
    professionalTone: !/\!\!\!|\?{2,}|lol|omg/.test(post),
    readableLength: post.split('\n').filter(l => l.trim().length > 50).length <= 5
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const score = (passed / Object.keys(checks).length) * 100;

  return { checks, score, passed: score >= 80 };
}

// Format post for output
function formatPostForOutput(postCopy, hashtags, topic, format, quality) {
  const timestamp = new Date().toISOString().split('T')[0];
  const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  return `=== LINKEDIN POST ===
Generated: ${now} EST
Format: ${format}
Topic: ${topic.title}
Quality Score: ${quality.score.toFixed(1)}%

---

${postCopy}

${hashtags}

---
Post ready to copy + paste to LinkedIn.
Optimal posting time: 8-9 AM EST (Tue/Wed/Thu)
Engagement hook: Question at end drives comments
---`;
}

// Main workflow
async function main() {
  try {
    log('🚀 Starting LinkedIn post generation...');
    
    // Get trending topic
    const topic = await getTrendingTopic();
    
    // Select format
    const format = selectFormat(topic);
    log(`📋 Selected format: ${format}`);
    
    // Generate post
    const postCopy = generatePost(topic, format);
    
    // Select hashtags
    const hashtags = selectHashtags(format);
    
    // Quality check
    const quality = qualityCheck(postCopy);
    log(`✅ Quality check: ${quality.score.toFixed(1)}% (${quality.passed ? 'PASS' : 'REVIEW'})`);
    
    // Format output
    const timestamp = new Date().toISOString().split('T')[0];
    const output = formatPostForOutput(postCopy, hashtags, topic, format, quality);
    
    // Save to file
    const outputFile = `${CONFIG.OUTPUT_DIR}/.linkedin-post-${timestamp}.txt`;
    fs.writeFileSync(outputFile, output);
    
    log(`✨ Post saved: ${outputFile}`);
    log(`📊 COMPLETE: ${format} post | Quality: ${quality.score.toFixed(1)}% | Ready to post`);
    
    console.log('\n' + output);
    
  } catch (error) {
    log(`❌ ERROR: ${error.message}`);
    process.exit(1);
  }
}

// Run
main();
