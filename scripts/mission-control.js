#!/usr/bin/env node

/**
 * Mission Control CLI
 * Manage subagent coordination state
 * 
 * Usage:
 *   mission-control read                    # Read current state
 *   mission-control update <agent> <key> <value>  # Update agent status
 *   mission-control inbox list              # Show pending inbox items
 *   mission-control inbox send <id>         # Execute pending task
 *   mission-control project <name> <status> # Update project status
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');

/**
 * Initialize state file if it doesn't exist
 */
function ensureStateFile() {
  if (!fs.existsSync(STATE_FILE)) {
    const initialState = {
      lastUpdate: new Date().toISOString(),
      agents: {
        laura: {
          name: 'Laura (Brand Strategy Manager)',
          status: 'idle',
          lastActivity: null,
          currentTask: null,
          output: null
        },
        'linkedin-bot': {
          name: 'LinkedIn Auto-Poster',
          status: 'scheduled',
          nextRun: null,
          lastPost: null
        },
        'code-reviewer': {
          name: 'Opus Code Review',
          status: 'idle',
          lastReview: null
        }
      },
      projects: {
        worksafeai: {
          status: 'production',
          lastDeploy: null,
          healthCheck: 'unknown',
          alerts: []
        },
        consensus: {
          status: 'staging',
          lastDeploy: null,
          healthCheck: 'unknown',
          alerts: []
        }
      },
      inbox: [],
      alerts: []
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(initialState, null, 2));
    console.log('✅ Mission Control initialized');
  }
}

/**
 * Read current state
 */
function readState() {
  ensureStateFile();
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

/**
 * Write state back
 */
function writeState(state) {
  state.lastUpdate = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * Display state
 */
function displayState(state) {
  console.log('\n═══════════════════════════════════════');
  console.log('  MISSION CONTROL STATUS');
  console.log('═══════════════════════════════════════\n');
  
  console.log('📋 AGENTS:');
  Object.entries(state.agents).forEach(([key, agent]) => {
    const status = agent.status === 'idle' ? '⏸️ ' : agent.status === 'reviewing' ? '🔍' : '🟢';
    console.log(`  ${status} ${agent.name}`);
    console.log(`     Status: ${agent.status}`);
    if (agent.lastActivity) console.log(`     Last: ${agent.lastActivity}`);
    if (agent.currentTask) console.log(`     Task: ${agent.currentTask}`);
  });
  
  console.log('\n🗂️  PROJECTS:');
  Object.entries(state.projects).forEach(([name, proj]) => {
    const health = proj.healthCheck === 'passing' ? '✅' : '⚠️';
    console.log(`  ${health} ${name}`);
    console.log(`     Status: ${proj.status}`);
    if (proj.lastDeploy) console.log(`     Deploy: ${proj.lastDeploy}`);
  });
  
  if (state.inbox.length > 0) {
    console.log('\n📬 INBOX:');
    state.inbox.forEach((item, idx) => {
      console.log(`  [${idx}] ${item.type} from ${item.from} → ${item.to}`);
      console.log(`      ${item.status}`);
      if (item.message) console.log(`      "${item.message.substring(0, 50)}..."`);
    });
  }
  
  if (state.alerts.length > 0) {
    console.log('\n🚨 ALERTS:');
    state.alerts.forEach((alert) => {
      console.log(`  [${alert.level}] ${alert.message}`);
    });
  }
  
  console.log(`\n📅 Last Updated: ${state.lastUpdate}\n`);
}

/**
 * Update agent status
 */
function updateAgent(agentName, updates) {
  const state = readState();
  
  if (!state.agents[agentName]) {
    console.error(`❌ Agent not found: ${agentName}`);
    process.exit(1);
  }
  
  state.agents[agentName] = {
    ...state.agents[agentName],
    ...updates,
    lastActivity: new Date().toISOString()
  };
  
  writeState(state);
  console.log(`✅ Updated ${agentName}`);
  console.log(JSON.stringify(state.agents[agentName], null, 2));
}

/**
 * Add inbox item
 */
function addInboxItem(from, to, type, message) {
  const state = readState();
  
  const item = {
    id: `inbox-${Date.now()}`,
    timestamp: new Date().toISOString(),
    from,
    to,
    type,
    message,
    status: 'ready-to-send',
    ttl: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
  
  state.inbox.push(item);
  writeState(state);
  
  console.log(`✅ Added to inbox: ${from} → ${to}`);
  console.log(`   ID: ${item.id}`);
}

/**
 * Show inbox
 */
function showInbox() {
  const state = readState();
  
  if (state.inbox.length === 0) {
    console.log('📭 Inbox is empty');
    return;
  }
  
  console.log('\n📬 INBOX ITEMS:\n');
  state.inbox.forEach((item, idx) => {
    console.log(`[${idx}] ${item.id}`);
    console.log(`    From: ${item.from} → To: ${item.to}`);
    console.log(`    Type: ${item.type}`);
    console.log(`    Status: ${item.status}`);
    console.log(`    "${item.message}"`);
    console.log(`    Expires: ${item.ttl}\n`);
  });
}

/**
 * Send inbox item
 */
function sendInboxItem(id) {
  const state = readState();
  const itemIdx = state.inbox.findIndex(i => i.id === id);
  
  if (itemIdx === -1) {
    console.error(`❌ Inbox item not found: ${id}`);
    process.exit(1);
  }
  
  const item = state.inbox[itemIdx];
  item.status = 'sent';
  item.sentAt = new Date().toISOString();
  
  writeState(state);
  console.log(`✅ Marked as sent: ${id}`);
  console.log(`   ${item.from} → ${item.to}`);
}

/**
 * Main CLI
 */
function main() {
  const [,,command, ...args] = process.argv;
  
  ensureStateFile();
  
  switch (command) {
    case 'read':
    case 'status':
    case undefined:
      displayState(readState());
      break;
      
    case 'agent':
      if (args[0] === 'set') {
        const [, agent, key, ...valueParts] = args;
        const value = valueParts.join(' ');
        updateAgent(agent, { [key]: value });
      } else {
        console.error('Usage: mission-control agent set <name> <key> <value>');
      }
      break;
      
    case 'inbox':
      if (args[0] === 'list') {
        showInbox();
      } else if (args[0] === 'add') {
        const [, from, to, type, ...msgParts] = args;
        const message = msgParts.join(' ');
        addInboxItem(from, to, type, message);
      } else if (args[0] === 'send') {
        sendInboxItem(args[1]);
      } else {
        console.error('Usage: mission-control inbox [list|add|send]');
      }
      break;
      
    default:
      console.log(`Mission Control CLI`);
      console.log(`\nUsage:`);
      console.log(`  mission-control [read|status]                   # Show current state`);
      console.log(`  mission-control agent set <agent> <key> <val>   # Update agent`);
      console.log(`  mission-control inbox list                      # Show inbox`);
      console.log(`  mission-control inbox add <from> <to> <type> <message>`);
      console.log(`  mission-control inbox send <id>                 # Mark item sent`);
  }
}

main();
