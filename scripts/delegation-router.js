#!/usr/bin/env node

/**
 * Delegation Router
 * 
 * Main orchestration system for Lucy.
 * Receives work → classifies → routes → executes → tracks
 */

const fs = require('fs');
const path = require('path');
const { classifyWork } = require('./work-classifier');
const { validateAgentForWork, loadMatrix } = require('./agent-registry');
const { runDelegationScan } = require('./heartbeat-delegation-scanner');

const WORKSPACE = process.env.WORKSPACE || path.join(process.env.HOME || '', '.openclaw', 'workspace');
const STATE_PATH = path.join(WORKSPACE, '.mission-control-state.json');
const LOG_PATH = path.join(WORKSPACE, '.delegation-log.json');

/**
 * Main delegation function
 * Called whenever work arrives
 */
async function delegateWork(incomingWork) {
  console.log(`\n📥 Incoming Work: ${incomingWork.description}`);
  console.log('═══════════════════════════════════════\n');
  
  // 1. Classify
  console.log('1️⃣  CLASSIFYING WORK...');
  const classification = classifyWork(incomingWork.description, {
    priority: incomingWork.priority,
    context: incomingWork.context
  });
  console.log(`   Category: ${classification.classification.categoryLabel}`);
  console.log(`   Priority: ${classification.classification.priority}`);
  console.log(`   Required: ${classification.classification.requiredSkills.slice(0, 3).join(', ')}...`);
  
  // 2. Validate delegation
  console.log('\n2️⃣  VALIDATING AGENT ASSIGNMENT...');
  const primaryAgent = classification.recommendation.primaryAgent;
  const validation = validateAgentForWork(primaryAgent, classification.classification.category);
  
  if (!validation.valid) {
    console.log(`   ❌ ${validation.reason}`);
    
    // Try alternatives
    if (classification.alternatives.length > 0) {
      console.log('   Trying alternative agents...');
      for (const alt of classification.alternatives) {
        const altValidation = validateAgentForWork(alt.agentId, classification.classification.category);
        if (altValidation.valid) {
          console.log(`   ✅ ${altValidation.reason}`);
          return await executeDelegate(incomingWork, alt.agentId, classification, true);
        }
      }
    }
    
    // Escalate to Tim
    console.log('   ⚠️  All agents unavailable. Escalating to Tim.');
    return await escalateToTim(incomingWork, classification);
  }
  
  console.log(`   ✅ ${validation.reason}`);
  
  // 3. Execute delegation
  return await executeDelegate(incomingWork, primaryAgent, classification);
}

/**
 * Execute the delegation
 */
async function executeDelegate(work, agentId, classification, isAlternative = false) {
  console.log('\n3️⃣  DELEGATING TO AGENT...');
  
  const matrix = loadMatrix();
  const agent = matrix.agents[agentId];
  
  console.log(`   📌 Assigned to: ${agent.name}`);
  console.log(`   💼 Role: ${agent.title}`);
  console.log(`   ⚡ Availability: ${agent.current_load || 0}/${agent.capacity || 1}`);
  
  // Create delegation record
  const delegation = {
    id: `d_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    workDescription: work.description,
    category: classification.classification.category,
    priority: classification.classification.priority,
    assignedAgent: agentId,
    wasAlternative: isAlternative,
    matchScore: classification.recommendation.matchScore,
    status: 'delegated',
    createdAt: new Date().toISOString(),
    dueBy: calculateDueDate(classification.classification.priority)
  };
  
  // 4. Brief the agent
  console.log('\n4️⃣  BRIEFING AGENT...');
  const briefing = generateBriefing(work, agent, classification);
  console.log(briefing);
  
  // 5. Update state
  console.log('\n5️⃣  UPDATING MISSION CONTROL STATE...');
  updateMissionControlState(delegation, agentId);
  console.log('   ✅ State updated');
  
  // 6. Log delegation
  console.log('\n6️⃣  LOGGING DELEGATION...');
  logDelegation(delegation);
  console.log('   ✅ Logged to delegation history');
  
  // 7. Summary
  console.log('\n═══════════════════════════════════════');
  console.log('✅ DELEGATION COMPLETE');
  console.log('═══════════════════════════════════════');
  console.log(`Delegated to: ${agent.name}`);
  console.log(`Priority: ${classification.classification.priority}`);
  console.log(`Due: ${delegation.dueBy}`);
  
  if (classification.escalation.shouldEscalateToTim) {
    console.log('\n⚠️  ESCALATING TO TIM (Critical priority)');
  }
  
  return delegation;
}

/**
 * Escalate work to Tim
 */
async function escalateToTim(work, classification) {
  console.log('\n⚠️  ESCALATING TO TIM');
  console.log('═══════════════════════════════════════');
  console.log(`Work: ${work.description}`);
  console.log(`Reason: ${classification.escalation.reason}`);
  console.log(`Priority: ${classification.classification.priority}`);
  
  const escalation = {
    id: `e_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    workDescription: work.description,
    reason: classification.escalation.reason,
    priority: classification.classification.priority,
    requiredDecision: classification.classification.categoryLabel,
    escalatedAt: new Date().toISOString(),
    status: 'awaiting_decision'
  };
  
  logEscalation(escalation);
  
  console.log('\n✅ Escalation logged. Tim will be notified.');
  console.log('═══════════════════════════════════════\n');
  
  return escalation;
}

/**
 * Generate briefing for agent
 */
function generateBriefing(work, agent, classification) {
  return `
Agent Brief for ${agent.name}:
─────────────────────────────────────
Task: ${work.description}
Category: ${classification.classification.categoryLabel}
Priority: ${classification.classification.priority.toUpperCase()}

Your Expertise:
- ${Object.entries(agent.skills)
  .filter(([_, level]) => level >= 8)
  .map(([skill, _]) => skill)
  .join('\n- ')
}

Required Skills:
${classification.classification.requiredSkills.slice(0, 5).map(s => `- ${s}`).join('\n')}

Success Criteria:
${generateSuccessCriteria(classification.classification.category)}

Estimated Time: ${estimateTime(classification.classification.priority)}

Next Steps:
1. Review task details above
2. Complete work using your expertise
3. Document findings/output
4. Report status to Lucy
5. Lucy will route to ${(classification.followupAgents || [])[0] || 'quality control'} for review
─────────────────────────────────────
  `.trim();
}

/**
 * Generate success criteria based on work category
 */
function generateSuccessCriteria(category) {
  const criteria = {
    code_review: [
      'All security issues identified and documented',
      'Architecture review completed',
      'Code quality assessment provided',
      'Bug report with reproduction steps'
    ],
    feature_development: [
      'Feature implemented and tested',
      'Code follows project standards',
      'Documentation updated',
      'Ready for review'
    ],
    design: [
      'Mockups/prototypes delivered',
      'Design specifications documented',
      'Responsive design verified',
      'Ready for handoff to development'
    ],
    strategy: [
      'Analysis completed with data',
      'Recommendations provided',
      'Competitive landscape mapped',
      'Action plan documented'
    ],
    qa_testing: [
      'Test cases executed',
      'Regressions identified',
      'Quality report generated',
      'Ready for production'
    ]
  };
  
  return (criteria[category] || [
    'Complete assigned work',
    'Document findings',
    'Ready for next phase'
  ]).map(c => `- ${c}`).join('\n');
}

/**
 * Estimate completion time
 */
function estimateTime(priority) {
  const estimates = {
    critical: '15-30 minutes',
    high: '1-2 hours',
    medium: '4-8 hours',
    low: '24-48 hours'
  };
  return estimates[priority] || '4-8 hours';
}

/**
 * Calculate due date
 */
function calculateDueDate(priority) {
  const now = new Date();
  const hoursToAdd = {
    critical: 0.25,      // 15 minutes
    high: 1,             // 1 hour
    medium: 4,           // 4 hours
    low: 24              // 24 hours
  };
  
  now.setHours(now.getHours() + (hoursToAdd[priority] || 4));
  return now.toISOString();
}

/**
 * Update mission control state
 */
function updateMissionControlState(delegation, agentId) {
  let state = {};
  
  try {
    state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {}
  
  // Update agent load
  if (!state.agents) state.agents = {};
  if (!state.agents[agentId]) state.agents[agentId] = { current_load: 0 };
  state.agents[agentId].current_load = (state.agents[agentId].current_load || 0) + 1;
  state.agents[agentId].lastDelegatedWork = delegation.workDescription;
  
  // Add delegation to tracking
  if (!state.delegations) state.delegations = [];
  state.delegations.push(delegation);
  
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

/**
 * Log delegation to history
 */
function logDelegation(delegation) {
  let log = [];
  
  try {
    log = JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
  } catch {}
  
  log.push(delegation);
  
  // Keep last 200 delegations
  if (log.length > 200) {
    log = log.slice(-200);
  }
  
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), 'utf8');
}

/**
 * Log escalations
 */
function logEscalation(escalation) {
  const escalationLogPath = path.join(WORKSPACE, '.escalation-log.json');
  let log = [];
  
  try {
    log = JSON.parse(fs.readFileSync(escalationLogPath, 'utf8'));
  } catch {}
  
  log.push(escalation);
  
  // Keep last 50 escalations
  if (log.length > 50) {
    log = log.slice(-50);
  }
  
  fs.writeFileSync(escalationLogPath, JSON.stringify(log, null, 2), 'utf8');
}

/**
 * Run full heartbeat delegation cycle
 */
async function runHeartbeatCycle() {
  console.log('\n🔄 HEARTBEAT DELEGATION CYCLE');
  console.log('═══════════════════════════════════════\n');
  
  // Run scanning
  const scanResults = runDelegationScan();
  
  return scanResults;
}

// CLI
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'delegate':
      const workDescription = process.argv[3];
      const priority = process.argv[4] || 'medium';
      
      delegateWork({
        description: workDescription,
        priority: priority
      });
      break;
      
    case 'heartbeat':
      runHeartbeatCycle();
      break;
      
    default:
      console.log(`
Delegation Router CLI

Commands:
  delegate <description> [priority]  - Delegate a work item
  heartbeat                          - Run full delegation scan
      `);
  }
}

module.exports = {
  delegateWork,
  executeDelegate,
  escalateToTim,
  runHeartbeatCycle
};
