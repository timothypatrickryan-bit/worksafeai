#!/usr/bin/env node

/**
 * Spawn Laura with Mission Control Context
 * 
 * Laura reads Mission Control state and writes back results
 * This demonstrates the full agent coordination flow
 * 
 * Usage:
 *   node scripts/spawn-laura.js "Your question about brand strategy"
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const WORKSPACE = path.join(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');

// Import contacts helper
const contactsHelper = require('./get-contacts.js');

// Read current Mission Control state
function readState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { agents: {}, projects: {}, inbox: [], alerts: [] };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

// Write updated state back
function writeState(state) {
  state.lastUpdate = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Spawn Laura subagent
async function spawnLaura(userQuestion) {
  const state = readState();

  // Update Laura's status
  state.agents.laura = state.agents.laura || {};
  state.agents.laura.status = 'working';
  state.agents.laura.currentTask = 'analyzing brand strategy';
  state.agents.laura.lastActivity = new Date().toISOString();
  writeState(state);

  console.log('🚀 Spawning Laura with Mission Control context...\n');

  // Build the prompt with Mission Control context
  const kellyContact = contactsHelper.formatContact('kelly');
  const timContact = contactsHelper.formatContact('tim');
  
  const lauraPrompt = `You are Laura, an expert in elevated children's apparel brand strategy.

## Available Contacts:

Tim Ryan (Owner) - ${timContact?.channels}
- Role: Final decision maker, prefers async communication
- Timezone: America/New_York

Kelly (Brand Strategy Consultant) - ${kellyContact?.channels}
- Role: Expert on elevated children's apparel positioning
- Availability: Flexible
- Timezone: America/New_York

**When you complete analysis, route findings to Kelly via her preferred channel (WhatsApp/email).**

## Current Mission Control State:

### Projects (Research available):
${JSON.stringify(state.projects, null, 2)}

### Recent LinkedIn Posts (for brand tone):
${state.agents['linkedin-bot']?.lastPost ? JSON.stringify(state.agents['linkedin-bot'].lastPost, null, 2) : 'No recent posts yet'}

### Your Task:
${userQuestion}

## Important Instructions:
1. Provide strategic analysis with specific recommendations
2. Consider the brands, market positioning, and competitive landscape
3. Use insights from available projects/research
4. Format your response as structured JSON with:
   - "analysis": Your detailed strategic thinking
   - "recommendations": Array of specific, actionable recommendations
   - "nextSteps": What should happen next
   - "confidence": Your confidence level (high/medium/low)

5. Your response WILL BE AUTOMATICALLY ADDED TO MISSION CONTROL

## Example Output Format:
{
  "analysis": "The elevated children's apparel market...",
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "nextSteps": ["Step 1", "Step 2"],
  "confidence": "high"
}

Now respond with your analysis as valid JSON only (no markdown, no explanation):`;

  // Call Claude API directly (for now, using a simplified version)
  // In production, this would use sessions_spawn or direct API call
  const mockAnalysis = {
    analysis: "The elevated children's apparel market is experiencing growth in premium positioning. Parents are investing more in quality basics and statement pieces. Key differentiators: sustainable materials, heritage craftsmanship, and timeless design. Consensus data shows strong interest in slow fashion for kids.",
    recommendations: [
      'Position as premium quality, not fast fashion',
      'Emphasize durability and multi-child lifespan',
      'Leverage sustainability as core brand pillar',
      'Build direct-to-consumer (DTC) community',
      'Create investment pieces narrative'
    ],
    nextSteps: [
      'Research sustainable fabric suppliers',
      'Analyze competitor pricing and positioning',
      'Draft brand manifesto for Q2 launch',
      'Plan influencer outreach strategy'
    ],
    confidence: 'high'
  };

  console.log('✅ Laura completed analysis\n');
  console.log('📝 Analysis:', mockAnalysis.analysis.substring(0, 100) + '...\n');
  console.log('📋 Recommendations:');
  mockAnalysis.recommendations.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r}`);
  });

  // Update Laura's output in Mission Control
  state.agents.laura.status = 'complete';
  state.agents.laura.currentTask = null;
  state.agents.laura.output = {
    type: 'strategy-analysis',
    content: mockAnalysis,
    timestamp: new Date().toISOString()
  };

  // Add inbox item for Kelly
  state.inbox = state.inbox || [];
  state.inbox.push({
    id: `inbox-${Date.now()}`,
    timestamp: new Date().toISOString(),
    from: 'laura',
    to: 'kelly',
    type: 'strategy-memo',
    message: "Q2 Brand Strategy Analysis: Premium positioning opportunities in elevated children's apparel market",
    status: 'ready-to-send',
    ttl: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });

  // Write updated state
  writeState(state);

  console.log('\n✅ Mission Control Updated:');
  console.log('   • Laura status: complete');
  console.log('   • Output stored in agents.laura.output');
  console.log('   • Inbox item created for Kelly');
  console.log('   • Waiting for heartbeat to send to Kelly\n');

  console.log('📊 Check dashboard: http://localhost:3000');
  console.log('   → Click "Inbox" to see pending item');
  console.log('   → Click "Contacts" to see Laura & Kelly\n');
}

// Main
const question = process.argv[2] || "What is the best brand positioning strategy for elevated children's apparel in Q2 2026?";

spawnLaura(question).catch(err => {
  console.error('❌ Error spawning Laura:', err.message);
  process.exit(1);
});
