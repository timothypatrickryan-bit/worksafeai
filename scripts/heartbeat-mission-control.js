#!/usr/bin/env node

/**
 * Mission Control Heartbeat
 * Monitors task board and reports pending work
 * 
 * Usage:
 *   node scripts/heartbeat-mission-control.js
 * 
 * Checks for:
 * - Tasks awaiting review
 * - Tasks ready to spawn
 * - Agents that need work assigned
 */

const fs = require('fs');
const path = require('path');
const { runDelegationScan } = require('./heartbeat-delegation-scanner');
const { TaskWorkflowExecutor } = require('./task-workflow-executor');
const { processBriefings } = require('./briefing-monitor');
const { checkAdjustments } = require('./adjustment-monitor');

const WORKSPACE = path.join(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');
const BRIEFINGS_FILE = path.join(WORKSPACE, '.briefings-generated.json');

function readState() {
  if (!fs.existsSync(STATE_FILE)) {
    return {
      tasks: [],
      agents: {},
      inbox: [],
      alerts: []
    };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function readBriefings() {
  if (!fs.existsSync(BRIEFINGS_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(BRIEFINGS_FILE, 'utf8'));
  } catch (err) {
    return {};
  }
}

function saveBriefings(briefings) {
  fs.writeFileSync(BRIEFINGS_FILE, JSON.stringify(briefings, null, 2), 'utf8');
}

/**
 * Process queued tasks: generate briefings and move to "briefing" status
 */
function processQueuedTasks(state) {
  const queuedTasks = (state.tasks || []).filter(t => t.status === 'queued');
  
  if (queuedTasks.length === 0) {
    return { processed: 0, briefingsGenerated: [] };
  }

  console.log(`\n📋 Processing ${queuedTasks.length} queued task(s)...\n`);

  const executor = new TaskWorkflowExecutor();
  const briefings = readBriefings();
  const generatedBriefings = [];

  queuedTasks.forEach((task) => {
    try {
      // Generate briefing for this task
      console.log(`  ⏳ Generating briefing for: ${task.title}`);
      const briefing = executor.generateBriefing(task);
      
      // Store briefing
      briefings[task.id] = briefing;
      generatedBriefings.push({
        taskId: task.id,
        title: task.title,
        briefingGenerated: new Date().toISOString()
      });

      // Update task status to "briefing"
      task.status = 'briefing';
      task.briefingGeneratedAt = new Date().toISOString();
      task.awaitingApproval = true;
      
      console.log(`  ✓ Briefing generated and saved`);
    } catch (err) {
      console.error(`  ✗ Error processing task ${task.id}:`, err.message);
      task.status = 'error';
      task.errorMessage = err.message;
    }
  });

  // Save updated state and briefings
  saveBriefings(briefings);
  saveState(state);

  return {
    processed: queuedTasks.length,
    briefingsGenerated: generatedBriefings
  };
}

function main() {
  const state = readState();
  
  // STEP 1: Process queued tasks - generate briefings and move to "briefing" status
  const briefingResults = processQueuedTasks(state);
  
  // Re-read state after processing
  const updatedState = readState();
  const tasksToReview = (updatedState.tasks || []).filter(t => t.status === 'review');
  const taskQueued = (updatedState.tasks || []).filter(t => t.status === 'queued');
  const taskAwaitingApproval = (updatedState.tasks || []).filter(t => t.status === 'briefing' && t.awaitingApproval);
  const inboxReady = (updatedState.inbox || []).filter(i => i.status === 'ready-to-send');
  const alerts = (updatedState.alerts || []).filter(a => a.level === 'critical');
  
  // Count agents by status
  const agentStatus = {
    idle: 0,
    working: 0,
    complete: 0,
  };
  
  Object.values(state.agents || {}).forEach(agent => {
    if (agent.status === 'idle') agentStatus.idle++;
    else if (agent.status === 'working') agentStatus.working++;
    else if (agent.status === 'complete') agentStatus.complete++;
  });

  console.log('\n' + '═'.repeat(60));
  console.log('  🎯 MISSION CONTROL HEARTBEAT');
  console.log('═'.repeat(60) + '\n');

  // Briefing automation results
  if (briefingResults.processed > 0) {
    console.log('📋 BRIEFING AUTOMATION:');
    console.log(`   ✓ Briefings Generated: ${briefingResults.processed}`);
    briefingResults.briefingsGenerated.forEach((brief) => {
      console.log(`     - ${brief.title}`);
    });
    console.log();
  }

  // Summary
  console.log('📊 BOARD SUMMARY:');
  console.log(`   Tasks Awaiting Review: ${tasksToReview.length}`);
  console.log(`   Tasks Awaiting Approval (Briefing): ${taskAwaitingApproval.length}`);
  console.log(`   Tasks Queued: ${taskQueued.length}`);
  console.log(`   Messages Ready to Send: ${inboxReady.length}`);
  console.log(`   Critical Alerts: ${alerts.length}`);
  console.log();

  // Agents status
  console.log('🤖 AGENTS:');
  console.log(`   Idle: ${agentStatus.idle}`);
  console.log(`   Working: ${agentStatus.working}`);
  console.log(`   Complete: ${agentStatus.complete}`);
  console.log();

  // Tasks awaiting approval (briefing generated)
  if (taskAwaitingApproval.length > 0) {
    console.log('🔍 AWAITING YOUR APPROVAL (Briefings Ready):');
    taskAwaitingApproval.forEach((task, i) => {
      console.log(`   [${i + 1}] ${task.title}`);
      console.log(`       → Assigned to: ${task.assignedTo}`);
      console.log(`       → Category: ${task.category || 'general'}`);
      console.log(`       → Briefing Generated: ${new Date(task.briefingGeneratedAt).toLocaleTimeString()}`);
      console.log(`       → Action: Review briefing and approve to spawn execution`);
      console.log();
    });
  }

  // Tasks awaiting review
  if (tasksToReview.length > 0) {
    console.log('⚠️  AWAITING YOUR REVIEW:');
    tasksToReview.forEach((task, i) => {
      console.log(`   [${i + 1}] ${task.title}`);
      console.log(`       → Assign to: ${task.assignedTo}`);
      if (task.description) {
        console.log(`       → Description: ${task.description.substring(0, 60)}${task.description.length > 60 ? '...' : ''}`);
      }
      console.log();
    });
  }

  // Queued tasks
  if (taskQueued.length > 0) {
    console.log('✅ READY TO RUN:');
    taskQueued.forEach((task, i) => {
      console.log(`   [${i + 1}] ${task.title} (assigned to ${task.assignedTo})`);
    });
    console.log();
  }

  // Messages waiting
  if (inboxReady.length > 0) {
    console.log('📬 MESSAGES READY TO SEND:');
    inboxReady.forEach((item, i) => {
      console.log(`   [${i + 1}] ${item.from} → ${item.to}`);
      console.log(`       "${item.message.substring(0, 50)}${item.message.length > 50 ? '...' : ''}"`);
    });
    console.log();
  }

  // Critical alerts
  if (alerts.length > 0) {
    console.log('🚨 CRITICAL ALERTS:');
    alerts.forEach((alert, i) => {
      console.log(`   [${i + 1}] ${alert.message}`);
    });
    console.log();
  }

  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  if (taskAwaitingApproval.length > 0) {
    console.log(`   → Approve ${taskAwaitingApproval.length} briefing${taskAwaitingApproval.length > 1 ? 's' : ''} to spawn execution agents`);
  }
  if (tasksToReview.length > 0) {
    console.log(`   → Review ${tasksToReview.length} pending task${tasksToReview.length > 1 ? 's' : ''} at http://localhost:3001`);
  }
  if (inboxReady.length > 0) {
    console.log(`   → Send ${inboxReady.length} message${inboxReady.length > 1 ? 's' : ''} from Inbox section`);
  }
  if (agentStatus.idle > 0 && taskQueued.length === 0) {
    console.log(`   → ${agentStatus.idle} agent${agentStatus.idle > 1 ? 's are' : ' is'} idle - create new tasks to keep them busy`);
  }
  if (alerts.length > 0) {
    console.log(`   → Address ${alerts.length} critical alert${alerts.length > 1 ? 's' : ''}`);
  }

  console.log('\n' + '═'.repeat(60) + '\n');

  // Run delegation scan
  console.log('🔄 Running delegation scan...\n');
  runDelegationScan();

  // Check for Tim's adjustment feedback
  console.log('🔍 Checking for Tim\'s feedback...\n');
  checkAdjustments().catch(err => {
    console.error(`❌ Adjustment check error: ${err.message}`);
  });

  // Process briefings (auto-respond to Status Requests, queue Work Briefings)
  console.log('📋 Processing briefings...\n');
  processBriefings().catch(err => {
    console.error(`❌ Briefing processing error: ${err.message}`);
  });

  // ✅ UPDATE TIMESTAMP: Dashboard stays fresh
  state.lastUpdate = new Date().toISOString();
  saveState(state);

  // Exit code: 0 if all clear, 1 if action needed
  const actionNeeded = tasksToReview.length > 0 || alerts.length > 0 || inboxReady.length > 0;
  process.exit(actionNeeded ? 1 : 0);
}

main();
