#!/usr/bin/env node

/**
 * LinkedIn Post + Image Download for Upload
 * 
 * Generates post + downloads Recraft image locally
 * Image is then uploaded during LinkedIn posting
 * 
 * Usage: node linkedin-post-with-download.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: '.env.recraft' });

const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSAHJ3Wmk1IbHNqEsACADrcFLfW5eLc';
const RECRAFT_API_TOKEN = process.env.RECRAFT_API_TOKEN;
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

// Real Northeast market angles with image prompts
const NORTHEAST_ANGLES = [
  {
    name: "Hyperscaler Rush",
    context: "Major hyperscalers (AWS, Google, Microsoft) accelerating Northeast expansion due to AI capex demand and East Coast proximity to financial/media hubs.",
    implication: "Infrastructure operators who can deploy fiber and structured cabling fast will own this cycle.",
    imagePrompt: "Modern hyperscale data center facility under construction, server rooms with fiber optic cables, blue and green lighting, professional architecture, high quality photography",
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
    imagePrompt: "Fiber optic cables glowing in blue and orange, fiber deployment in progress, modern infrastructure, data center interconnect, professional photography, high quality",
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
    imagePrompt: "Power infrastructure, electrical distribution systems, backup generators, power management facility, industrial equipment, professional photography",
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
    imagePrompt: "Business consolidation, merger and acquisition concept, network connectivity, data center networks interconnected, strategic business visualization",
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
    imagePrompt: "Edge computing networks, distributed data centers, core and edge infrastructure, network nodes, connectivity visualization, professional technology imagery",
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

    https.get(url, { headers: { 'X-Subscription-Token': BRAVE_API_KEY } }, (res) => {
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

function generateRecraftImage(prompt) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      prompt,
      model: 'recraftv4',
      n: 1,
      size: '1024x1024'
    });

    const options = {
      hostname: 'external.api.recraft.ai',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RECRAFT_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode === 200 && json.data && json.data.length > 0) {
            console.log(`✅ Image generated: ${json.data[0].url.substring(0, 60)}...`);
            resolve({
              success: true,
              url: json.data[0].url,
              revisedPrompt: json.data[0].revised_prompt
            });
          } else {
            console.log(`⚠️  Image generation failed (${res.statusCode})`);
            resolve({ success: false, error: json.error || 'Unknown error' });
          }
        } catch (e) {
          console.log(`⚠️  Image parse error: ${e.message}`);
          resolve({ success: false, error: e.message });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`⚠️  Image request error: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
    
    req.write(postData);
    req.end();
  });
}

function downloadImage(url, filepath) {
  return new Promise((resolve) => {
    https.get(url, (response) => {
      const file = fs.createWriteStream(filepath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Image downloaded: ${filepath}`);
        resolve({ success: true, filepath });
      });
    }).on('error', (err) => {
      console.log(`⚠️  Download error: ${err.message}`);
      fs.unlink(filepath, () => {}); // Delete incomplete file
      resolve({ success: false, error: err.message });
    });
  });
}

async function generatePostWithImage() {
  try {
    console.log('🚀 Generating Northeast DC/Fiber post with image download...\n');

    // Pick a Northeast market angle
    const angle = NORTHEAST_ANGLES[Math.floor(Math.random() * NORTHEAST_ANGLES.length)];
    console.log(`🎯 Angle: ${angle.name}`);
    console.log(`📊 Context: ${angle.context}\n`);

    // Try to find real Northeast DC/Fiber news
    let article = null;
    let searchAttempts = 0;
    while (!article && searchAttempts < 2) {
      const searchCategory = NORTHEAST_SEARCHES[Math.floor(Math.random() * NORTHEAST_SEARCHES.length)];
      const query = searchCategory.queries[Math.floor(Math.random() * searchCategory.queries.length)];
      
      console.log(`🔍 Searching: "${query}"`);
      const results = await searchBrave(query);
      
      if (results.length > 0) {
        article = results[0];
        console.log(`✅ Found: ${article.title.substring(0, 70)}...\n`);
      }
      searchAttempts++;
    }

    if (!article) {
      console.log(`ℹ️  No real articles found. Using market context.\n`);
    }

    // Generate image
    console.log(`🎨 Generating Recraft image...`);
    const imageResult = await generateRecraftImage(angle.imagePrompt);

    // Download image locally
    let localImagePath = null;
    if (imageResult.success) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      localImagePath = path.join(WORKSPACE, `.linkedin-post-${timestamp}.jpg`);
      console.log(`📥 Downloading image locally...`);
      const downloadResult = await downloadImage(imageResult.url, localImagePath);
      
      if (!downloadResult.success) {
        console.log(`⚠️  Download failed, will use URL instead`);
        localImagePath = null;
      }
    }

    // Generate post text
    const engagement = angle.engagementHooks[Math.floor(Math.random() * angle.engagementHooks.length)];
    const post = generatePost(angle, article, engagement);

    // Save post data
    const postData = {
      type: 'insight',
      angle: angle.name,
      fullPost: post,
      context: angle.context,
      implication: angle.implication,
      source: article?.title || "Northeast Market Analysis",
      sourceUrl: article?.url || "https://protelinfrastructure.com",
      image: {
        url: imageResult.success ? imageResult.url : null,
        prompt: angle.imagePrompt,
        revisedPrompt: imageResult.revisedPrompt || null,
        localPath: localImagePath, // ← NEW: local file path
        status: imageResult.success ? 'ready' : 'failed',
        error: imageResult.error || null
      },
      generatedAt: new Date().toISOString(),
      status: 'ready-to-post'
    };

    fs.writeFileSync(
      path.join(WORKSPACE, '.linkedin-current-post.json'),
      JSON.stringify(postData, null, 2)
    );

    console.log(`\n✅ Post + Image generated and saved\n`);
    console.log(`📄 POST:\n${post}\n`);
    if (localImagePath) {
      console.log(`🖼️  IMAGE (local):\n${localImagePath}\n`);
      console.log(`📊 File size: ${Math.round(fs.statSync(localImagePath).size / 1024)} KB\n`);
    }
    if (imageResult.success && !localImagePath) {
      console.log(`🖼️  IMAGE (URL):\n${imageResult.url}\n`);
    }

    console.log(`\n✅ Ready to post to LinkedIn with image upload!`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (!RECRAFT_API_TOKEN) {
  console.error('❌ Error: RECRAFT_API_TOKEN not set in .env.recraft');
  process.exit(1);
}

generatePostWithImage();
