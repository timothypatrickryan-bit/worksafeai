#!/usr/bin/env node

/**
 * LinkedIn Post Generation with Brave Search Integration
 * Generates data-backed posts using trending topics from Brave Search
 * Usage: node linkedin-post-now-brave.js [insight|trending]
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
require("dotenv").config();

const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
const WORKSPACE = "/Users/timothyryan/.openclaw/workspace";

// Industry keywords for searching
const SEARCH_CONFIGS = {
  insight: {
    queries: [
      "data center infrastructure trends 2026",
      "edge computing economics challenges",
      "5G network deployment latest news",
      "structured cabling standards updates",
      "colocation market growth analysis",
      "network resilience requirements",
      "fiber optic deployment trends"
    ],
    focus: "industry-insight"
  },
  trending: {
    queries: [
      "data center news today",
      "telecommunications breaking news",
      "wireless technology announcements",
      "infrastructure investment deals",
      "enterprise network upgrades",
      "cloud computing infrastructure",
      "network modernization trends"
    ],
    focus: "trending-topic"
  }
};

/**
 * Fetch from Brave Search API using https
 */
function fetchBraveSearch(query) {
  return new Promise((resolve, reject) => {
    const searchUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&freshness=pastweek`;

    const options = {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-Subscription-Token": BRAVE_API_KEY
      }
    };

    https.get(searchUrl, options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    }).on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Extract key insights from Brave search results
 */
function extractInsights(results, query) {
  // Handle both array and object responses
  const resultArray = Array.isArray(results) ? results : (results && results.results) ? results.results : [];
  
  const insights = resultArray.slice(0, 3).map(result => ({
    title: result.title || "Untitled",
    description: result.description || result.snippet || "No description",
    url: result.url || "",
    source: result.url ? new URL(result.url).hostname : "unknown"
  }));

  return {
    query,
    insights: insights.length > 0 ? insights : [],
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate post text from content
 */
function generatePostText(type, topic, insights) {
  if (insights.length === 0) {
    return generateFallbackText(type, topic);
  }

  const topInsight = insights[0];
  const secondaryInsights = insights.slice(1).map(i => i.title).join(" • ");

  let post = "";

  if (type === "trending") {
    post = `🚨 Breaking News Alert

${topInsight.title}

This matters for data center & telecom infrastructure:
• Affects network capacity planning
• Impacts infrastructure investment decisions  
• Shapes vendor selection criteria

What are you seeing in your networks? 👇

Source: ${topInsight.source}
---
—Lucy, Tim's AI Agent`;
  } else {
    post = `💡 Industry Insight

${topInsight.title}

Key takeaway: Smart infrastructure investments are doubling down on resilience and optimization. The winners? Organizations that act fast.

${secondaryInsights ? `Related trends: ${secondaryInsights}` : ""}

Your thoughts? Drop a comment 👇

Source: ${topInsight.source}
---
—Lucy, Tim's AI Agent`;
  }

  return post;
}

/**
 * Fallback post if search fails
 */
function generateFallbackText(type, topic) {
  if (type === "trending") {
    return `🚨 Market Alert: Data Center & Telecom Sector

The infrastructure industry continues to evolve rapidly. Real-time monitoring of emerging trends is critical for staying competitive.

Key focus areas:
• Network resilience & redundancy
• Edge computing deployment
• 5G infrastructure expansion

What's driving change in YOUR market?

---
—Lucy, Tim's AI Agent`;
  } else {
    return `💡 Infrastructure Strategy Deep Dive

Building resilient networks requires more than technology—it requires strategic foresight.

Three things smart teams are doing right now:
1. Investing in redundancy across multiple sites
2. Modernizing cabling infrastructure for future capacity
3. Adopting agile deployment practices

Where is your organization focusing investment?

---
—Lucy, Tim's AI Agent`;
  }
}

/**
 * Save post to file
 */
function savePost(postText, type, content) {
  const postObject = {
    fullPost: postText,
    type,
    topic: content.query,
    generatedAt: new Date().toISOString(),
    sources: content.insights.map(i => i.url).filter(u => u),
    status: "ready-to-post"
  };

  const filePath = path.join(WORKSPACE, ".linkedin-current-post.json");
  fs.writeFileSync(filePath, JSON.stringify(postObject, null, 2));

  return postObject;
}

/**
 * Log activity
 */
function logActivity(type, post, success = true) {
  const logPath = path.join(WORKSPACE, ".linkedin-posts.log");
  const status = success ? "✅" : "⚠️";
  const entry = `[${new Date().toISOString()}] ${status} Generated ${type} post: "${post.topic.substring(0, 50)}..."\n`;

  fs.appendFileSync(logPath, entry);
}

/**
 * Main
 */
async function main() {
  const postType = process.argv[2] || "insight";

  if (!BRAVE_API_KEY) {
    console.error("❌ BRAVE_API_KEY not set. Add to .env file.");
    process.exit(1);
  }

  console.log(`📝 Generating LinkedIn ${postType} post...`);

  try {
    const config = SEARCH_CONFIGS[postType] || SEARCH_CONFIGS.insight;
    const query = config.queries[Math.floor(Math.random() * config.queries.length)];

    console.log(`🔍 Searching Brave: "${query}"`);

    const searchResult = await fetchBraveSearch(query);
    const webResults = searchResult.web || [];

    if (webResults.length === 0) {
      console.log("⚠️  No search results found, using fallback post");
    }

    const content = extractInsights(webResults, query);
    const postText = generatePostText(postType, query, content.insights);
    const post = savePost(postText, postType, content);

    logActivity(postType, post, true);

    console.log("\n📰 Generated Post:\n");
    console.log(postText);
    console.log("\n✅ Post saved to .linkedin-current-post.json");
    console.log(`📊 Sources: ${content.insights.map(i => i.source).join(", ")}`);

  } catch (error) {
    console.error("❌ Error:", error.message);
    
    // Generate fallback post on error
    const fallbackText = generateFallbackText(postType, "market trends");
    const fallbackPost = {
      fullPost: fallbackText,
      type: postType,
      topic: "fallback-post",
      generatedAt: new Date().toISOString(),
      status: "ready-to-post",
      note: "Generated with fallback due to search error"
    };

    const filePath = path.join(WORKSPACE, ".linkedin-current-post.json");
    fs.writeFileSync(filePath, JSON.stringify(fallbackPost, null, 2));
    
    logActivity(postType, fallbackPost, false);
    
    console.log("\n⚠️  Using fallback post:\n");
    console.log(fallbackText);
    console.log("\n✅ Fallback post saved");
    
    process.exit(0);
  }
}

main().catch(error => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
