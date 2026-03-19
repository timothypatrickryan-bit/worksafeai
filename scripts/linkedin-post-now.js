#!/usr/bin/env node

/**
 * LinkedIn Post Now - Force post any day (for testing/manual trigger)
 * Usage: node linkedin-post-now.js [insight|trending]
 */

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

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
  ];
  return insights[Math.floor(Math.random() * insights.length)];
}

/**
 * Generate a Trending Topic post
 */
function generateTrendingPost() {
  const topics = [
    {
      title: "The Wireless Towers Are Watching (And Learning)",
      content: "Tower infrastructure used to be dumb. Antenna placement. Frequency allocation. Passive reception. Done.\n\nNow? Towers are sensor arrays. They detect congestion, predict failures, optimize handoff in real-time.\n\nThe wireless operators building intelligence into their tower networks are not just improving service. They are creating entirely new data streams. That is where the competitive advantage actually lives in 2026.",
    },
    {
      title: "Ray Tracing in Wireless—The Next Frontier",
      content: "Ray tracing started in graphics. Now it's moving to wireless propagation modeling.\n\nPredicting how radio waves bounce through complex urban environments used to require expensive simulations. Now we're doing real-time ray tracing to optimize signal paths.\n\nIt sounds academic. It's not. This is how you get 5G to actually work in dense urban deployments. This is competitive advantage.",
    },
  ];
  return topics[Math.floor(Math.random() * topics.length)];
}

/**
 * Main
 */
try {
  const type = process.argv[2] || 'insight';
  
  if (type !== 'insight' && type !== 'trending') {
    console.error('❌ Invalid type. Use: insight or trending');
    process.exit(1);
  }

  const post = type === 'insight' ? generateInsightPost() : generateTrendingPost();

  const postData = {
    timestamp: new Date().toISOString(),
    type: type,
    title: post.title,
    content: post.content,
    fullPost: post.content + '\n\n---\nLucy, Tim\'s AI Agent'
  };

  const workspacePath = path.join(__dirname, '..');
  fs.writeFileSync(
    path.join(workspacePath, '.linkedin-current-post.json'),
    JSON.stringify(postData, null, 2)
  );

  console.log('✅ Post generated');
  console.log('📝 Type:', type);
  console.log('📋 Title:', postData.title);
  console.log('💾 Saved to: .linkedin-current-post.json');
  console.log('');
  console.log('Content:');
  console.log('---');
  console.log(postData.fullPost);
  console.log('---');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
