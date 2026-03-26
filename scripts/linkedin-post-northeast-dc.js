#!/usr/bin/env node

/**
 * LinkedIn Northeast Data Center + Fiber Market Commentary
 * 
 * Purpose: Generate posts tied to REAL Northeast DC/Fiber announcements
 * Focus: PA/NY data center construction, fiber deployment, hyperscaler activity
 * 
 * Data Source Strategy:
 * 1. Search for specific Northeast DC/Fiber announcements
 * 2. Reference actual projects, companies, timelines
 * 3. Add executive commentary about market implications
 * 4. Engagement question grounded in real market dynamics
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.BRAVE_API_KEY || 'BSAHJ3Wmk1IbHNqEsACADrcFLfW5eLc';
const WORKSPACE = process.env.WORKSPACE || '/Users/timothyryan/.openclaw/workspace';

// Northeast-specific search queries (PA, NY focus)
const NORTHEAST_SEARCHES = [
  {
    topic: "Data Center Expansion",
    queries: [
      "new data center Pennsylvania 2026",
      "data center New York construction announcement",
      "hyperscaler facility expansion Northeast",
      "Pennsylvania data center capex 2026",
      "New York fiber infrastructure investment"
    ]
  },
  {
    topic: "Fiber Deployment",
    queries: [
      "fiber optic Pennsylvania deployment 2026",
      "broadband fiber New York construction",
      "undersea cable landing Northeast",
      "fiber network expansion Pennsylvania",
      "data center interconnect fiber Northeast"
    ]
  },
  {
    topic: "Hyperscaler Activity",
    queries: [
      "AWS Google Microsoft data center Pennsylvania New York",
      "hyperscaler capex Northeast region 2026",
      "tech company infrastructure investment Pennsylvania",
      "AI data center facilities Northeast expansion"
    ]
  },
  {
    topic: "Infrastructure Market",
    queries: [
      "Northeast data center market analysis 2026",
      "Pennsylvania infrastructure operator growth",
      "New York colocation capacity demand",
      "regional data center shortage capacity"
    ]
  }
];

// Real Northeast market angles (editable - update as market changes)
const NORTHEAST_ANGLES = [
  {
    name: "Hyperscaler Rush",
    context: "Major hyperscalers (AWS, Google, Microsoft) accelerating Northeast expansion due to AI capex demand and East Coast proximity to financial/media hubs.",
    implication: "Infrastructure operators who can deploy fiber and structured cabling fast will own this cycle.",
    engagementHooks: [
      "Which hyperscaler are you seeing most aggressive in your territory?",
      "How are you positioning to serve this wave of data center construction?",
      "What's your capacity to handle 5-10 new hyperscaler projects simultaneously?"
    ]
  },
  {
    name: "Fiber Gold Rush",
    context: "Fiber deployment in PA/NY accelerating—both hyperscaler interconnect and last-mile broadband. Major investments in undersea cables landing on Northeast coast.",
    implication: "Fiber expertise is becoming a critical differentiator. Operators with fiber knowledge will be preferred partners.",
    engagementHooks: [
      "How deep is your team's fiber deployment experience?",
      "Are you positioning fiber as a service or just installation?",
      "What's your strategy for competing with national fiber operators?"
    ]
  },
  {
    name: "Power Constraints",
    context: "Northeast power grid already stressed. Data center power availability becoming a limiting factor for expansion in some PA/NY locations.",
    implication: "Locations with power infrastructure solutions become premium. Creative power partnerships matter.",
    engagementHooks: [
      "How are your locations solving the power constraint problem?",
      "Are you seeing power availability reject deals in your market?",
      "What's your power redundancy story to customers?"
    ]
  },
  {
    name: "Regional Consolidation",
    context: "Smaller regional data center operators consolidating or being acquired. Market moving toward scale.",
    implication: "Operators must either scale fast or specialize deeply. Middle ground disappears.",
    engagementHooks: [
      "How are you positioning against consolidation pressure?",
      "What's your defensible market position?",
      "Is scale or specialization your growth strategy?"
    ]
  },
  {
    name: "Edge vs Core",
    context: "AI workloads driving demand for both massive core facilities AND edge compute. Northeast seeing investment in both.",
    implication: "Operators need capability across full spectrum—not just one or the other.",
    engagementHooks: [
      "How are you serving both hyperscale core AND edge compute markets?",
      "What's the margin profile difference between core and edge?",
      "How do you staff/skill for both segments?"
    ]
  }
];

function searchBrave(query) {
  return new Promise((resolve) => {
    const params = new URLSearchParams({ q: query, count: 3 });
    const url = `https://api.search.brave.com/res/v1/web/search?${params}`;

    https.get(url, { headers: { 'X-Subscription-Token': API_KEY } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.web && Array.isArray(result.web) && result.web.length > 0) {
            resolve(result.web.map(item => ({
              title: item.title,
              url: item.url,
              description: item.description,
            })));
          } else {
            resolve([]);
          }
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

async function generateNortheastPost(postType = 'insight') {
  console.log(`📝 Generating Northeast DC/Fiber market post...\n`);

  // Pick a Northeast market angle
  const angle = NORTHEAST_ANGLES[Math.floor(Math.random() * NORTHEAST_ANGLES.length)];
  console.log(`🎯 Angle: ${angle.name}`);
  console.log(`📊 Context: ${angle.context}\n`);

  // Try to find real Northeast DC/Fiber news
  let article = null;
  let searchAttempts = 0;
  while (!article && searchAttempts < 3) {
    const searchCategory = NORTHEAST_SEARCHES[Math.floor(Math.random() * NORTHEAST_SEARCHES.length)];
    const query = searchCategory.queries[Math.floor(Math.random() * searchCategory.queries.length)];
    
    console.log(`🔍 Searching: "${query}"`);
    const results = await searchBrave(query);
    
    if (results.length > 0) {
      article = results[0];
      console.log(`✅ Found: ${article.title.substring(0, 60)}...\n`);
    }
    searchAttempts++;
  }

  if (!article) {
    console.log(`⚠️  No real articles found. Using market context.\n`);
  }

  // Generate post
  const engagement = angle.engagementHooks[Math.floor(Math.random() * angle.engagementHooks.length)];
  
  const post = generatePost(angle, article, engagement, postType);

  // Save
  const postData = {
    type: postType,
    angle: angle.name,
    fullPost: post,
    context: angle.context,
    implication: angle.implication,
    source: article?.title || "Northeast Market Analysis",
    sourceUrl: article?.url || "https://protelinfrastructure.com",
    generatedAt: new Date().toISOString(),
    status: "ready-to-post"
  };

  fs.writeFileSync(
    path.join(WORKSPACE, '.linkedin-current-post.json'),
    JSON.stringify(postData, null, 2)
  );

  console.log(`✅ Post generated and saved\n`);
  console.log(`📄 POST:\n${post}\n`);
}

function generatePost(angle, article, engagement, format) {
  const baseText = `**${angle.name.toUpperCase()}**

${article ? `Recent news: ${article.title}` : `Market reality: ${angle.context}`}

Here's what this means for infrastructure operators:
• ${angle.implication}
• Speed of deployment becomes competitive advantage
• Operators who understand this market win

The question isn't whether this happens. It's whether you're ahead of it.

${engagement}

---
— Tim Ryan, Pro-Tel`;

  return baseText;
}

// Run
const type = process.argv[2] || 'insight';
generateNortheastPost(type).catch(err => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
