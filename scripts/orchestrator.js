#!/usr/bin/env node
/**
 * ORCHESTRATOR — Strategic Autonomous Work Generator
 * 
 * Mission: Drive the organization toward its strategic goals by intelligently
 * generating and queuing the next high-impact work for agents to execute.
 * 
 * Responsibilities:
 * 1. Read master mission and current state
 * 2. Analyze progress toward goals (6 pillars)
 * 3. Identify highest-leverage next work
 * 4. Generate detailed briefings for that work
 * 5. Queue tasks for agent execution
 * 6. Monitor blockers and escalate as needed
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', '.mission-control-state.json');
const MEMORY_FILE = path.join(__dirname, '..', 'MEMORY.md');
const LOG_FILE = path.join(__dirname, '..', '.orchestrator.log');

// Strategic priorities (6 pillars of mission success)
const PILLARS = {
  AUTONOMY: {
    name: 'Autonomy & Independence',
    priority: 1,
    description: 'Agents should make decisions independently without constant direction'
  },
  VALUE: {
    name: 'Value Generation & Delivery',
    priority: 2,
    description: 'Measurable output and business impact'
  },
  STRUCTURE: {
    name: 'Organization & Structure',
    priority: 3,
    description: 'Clear roles, coordination, specialization'
  },
  SCALABILITY: {
    name: 'Scalability & Growth',
    priority: 4,
    description: 'Grow team/workload efficiently'
  },
  RELIABILITY: {
    name: 'Reliability & Resilience',
    priority: 5,
    description: 'Uptime, error recovery, data integrity'
  },
  COLLABORATION: {
    name: 'Human-AI Collaboration',
    priority: 6,
    description: 'Transparency, feedback loops, trust'
  }
};

// Active projects and their states
const PROJECTS = {
  WORKSAFEAI: {
    name: 'WorkSafeAI',
    status: 'phase-2-in-progress',
    current_work: ['Billing integration', 'Redis caching', 'Database migrations'],
    next_work: ['Integration tests', 'WebSocket real-time', 'Deployment hardening'],
    priority: 1
  },
  CONSENSUS: {
    name: 'Consensus',
    status: 'phase-1-complete',
    current_work: ['Staging verification'],
    next_work: ['Phase 2: Expand data sources', 'Admin dashboard', 'Advanced search'],
    priority: 2
  },
  LINKEDIN: {
    name: 'LinkedIn Automation',
    status: 'deployed',
    current_work: ['Auto-posting Tue/Thu/Sat'],
    next_work: ['Performance analytics', 'Engagement tracking', 'Audience growth'],
    priority: 3
  },
  MISSION_CONTROL: {
    name: 'Mission Control',
    status: 'operational',
    current_work: ['Briefing approval', 'Task execution'],
    next_work: ['Real-time dashboard updates', 'Advanced analytics', 'Predictive recommendations'],
    priority: 2
  }
};

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (err) {
    log(`ERROR reading state: ${err.message}`);
    return null;
  }
}

function writeState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    log(`ERROR writing state: ${err.message}`);
  }
}

function readMemory() {
  try {
    return fs.readFileSync(MEMORY_FILE, 'utf8');
  } catch (err) {
    log(`ERROR reading memory: ${err.message}`);
    return '';
  }
}

function analyzeProgress() {
  const state = readState();
  if (!state || !state.tasks) return {};

  return {
    total_tasks: state.tasks.length,
    completed: state.tasks.filter(t => t.status === 'completed').length,
    in_progress: state.tasks.filter(t => t.status === 'executing' || t.status === 'in-progress').length,
    queued: state.tasks.filter(t => t.status === 'queued').length,
    briefing: state.tasks.filter(t => t.status === 'briefing').length
  };
}

function generateNextWork() {
  const progress = analyzeProgress();
  const state = readState();

  log('📊 Analyzing progress...');
  log(`  Completed: ${progress.completed}, In-Progress: ${progress.in_progress}, Queued: ${progress.queued}`);

  // Priority ranking for next work (highest impact first)
  const workQueue = [];

  // 1. AUTONOMY — Enable agents to make decisions independently
  if (progress.completed < 10) {
    workQueue.push({
      pillar: 'AUTONOMY',
      priority: 1,
      title: 'Implement Agent Decision Logic Framework',
      description: 'Enable agents to make autonomous decisions for task routing, priority adjustment, and blocker resolution without waiting for human approval',
      assignedTo: 'chief',
      briefing: {
        executionPlan: {
          timeline: { summary: '2-3 days' },
          deliverables: [
            'Decision-making framework spec',
            'Agent autonomy scoring system',
            'Auto-escalation rules for blockers',
            'Confidence-based task adjustment logic'
          ],
          milestones: [
            { name: 'Framework Design', description: 'Define decision patterns and confidence thresholds', estimatedDays: 0.5 },
            { name: 'Implementation', description: 'Build scoring and routing logic', estimatedDays: 1.5 },
            { name: 'Testing & Validation', description: 'Verify autonomy rules with live tasks', estimatedDays: 1 }
          ],
          successCriteria: [
            { type: 'Completion', description: 'Framework deployed and agents using it' },
            { type: 'Autonomy', description: 'Agents resolve 80%+ of routine issues independently' }
          ]
        }
      }
    });
  }

  // 2. VALUE — Measure and amplify business impact
  if (progress.completed < 15) {
    workQueue.push({
      pillar: 'VALUE',
      priority: 2,
      title: 'Implement Output Quality Metrics & Delivery Dashboard',
      description: 'Establish measurable KPIs for agent work quality, delivery speed, and business impact. Build visibility dashboard for stakeholders.',
      assignedTo: 'johnny',
      briefing: {
        executionPlan: {
          timeline: { summary: '2 days' },
          deliverables: [
            'KPI definition (quality, speed, impact)',
            'Metrics collection system',
            'Delivery dashboard for stakeholders',
            'Weekly impact reports'
          ],
          milestones: [
            { name: 'Metrics Design', description: 'Define what success looks like', estimatedDays: 0.5 },
            { name: 'Dashboard Build', description: 'Create visibility UI', estimatedDays: 1.5 }
          ],
          successCriteria: [
            { type: 'Completion', description: 'Metrics defined and dashboard live' },
            { type: 'Impact', description: 'Can track business value from agent work' }
          ]
        }
      }
    });
  }

  // 3. WORKSAFEAI PHASE 2 — Keep primary project moving
  if (!state.tasks.some(t => t.assignedTo === 'chief' && t.title.includes('Stripe'))) {
    workQueue.push({
      pillar: 'VALUE',
      priority: 2,
      title: 'WorkSafeAI: Implement Stripe Billing Integration',
      description: 'Add payment processing for subscription tiers. Enable free trial tracking and recurring billing.',
      assignedTo: 'chief',
      briefing: {
        executionPlan: {
          timeline: { summary: '3-4 days' },
          deliverables: [
            'Stripe API integration',
            'Subscription tier models',
            'Trial tracking system',
            'Webhook handlers for payment events',
            'Billing dashboard UI'
          ],
          milestones: [
            { name: 'API Setup', description: 'Stripe keys and basic integration', estimatedDays: 0.5 },
            { name: 'Subscription Logic', description: 'Tier models and trial management', estimatedDays: 1 },
            { name: 'Webhook Handlers', description: 'Payment event processing', estimatedDays: 1 },
            { name: 'UI & Testing', description: 'Dashboard and end-to-end testing', estimatedDays: 1.5 }
          ],
          successCriteria: [
            { type: 'Completion', description: 'Payments processing in staging' },
            { type: 'Testing', description: 'Trial signup and payment flow tested' }
          ]
        }
      }
    });
  }

  // 4. CONSENSUS PHASE 2 — Expand secondary project
  if (!state.tasks.some(t => t.title.includes('Wirecutter') || t.title.includes('data source'))) {
    workQueue.push({
      pillar: 'SCALABILITY',
      priority: 3,
      title: 'Consensus: Add Wirecutter Home & Advanced Searchers',
      description: 'Expand Consensus to cover home/furniture category with Wirecutter integration and improve search relevance.',
      assignedTo: 'johnny',
      briefing: {
        executionPlan: {
          timeline: { summary: '2-3 days' },
          deliverables: [
            'Wirecutter searcher implementation',
            'Home category expansion',
            'Relevance ranking improvements',
            'Testing and validation'
          ],
          milestones: [
            { name: 'Searcher Build', description: 'Implement Wirecutter scraper', estimatedDays: 1 },
            { name: 'Integration', description: 'Wire into aggregation pipeline', estimatedDays: 0.5 },
            { name: 'Testing & Deploy', description: 'End-to-end verification', estimatedDays: 1.5 }
          ],
          successCriteria: [
            { type: 'Coverage', description: 'Home category fully functional' },
            { type: 'Quality', description: 'Wirecutter results highly relevant' }
          ]
        }
      }
    });
  }

  // 5. STRUCTURE — Document agent specialties and roles
  if (!state.tasks.some(t => t.title.includes('Agent Specialty') || t.title.includes('role'))) {
    workQueue.push({
      pillar: 'STRUCTURE',
      priority: 4,
      title: 'Document Agent Specialties & Organizational Structure',
      description: 'Create comprehensive documentation of each agent\'s expertise, decision-making authority, and coordination protocols.',
      assignedTo: 'laura',
      briefing: {
        executionPlan: {
          timeline: { summary: '1-2 days' },
          deliverables: [
            'Agent specialty matrix (skills × projects)',
            'Decision-making authority guide',
            'Coordination protocols',
            'Escalation procedures',
            'Handoff documentation'
          ],
          milestones: [
            { name: 'Analysis', description: 'Inventory current capabilities', estimatedDays: 0.5 },
            { name: 'Documentation', description: 'Write guides and matrices', estimatedDays: 1 }
          ],
          successCriteria: [
            { type: 'Clarity', description: 'Clear roles for each agent' },
            { type: 'Coordination', description: 'Teams know how to work together' }
          ]
        }
      }
    });
  }

  return workQueue;
}

function queueWork(workItems) {
  const state = readState();
  if (!state) return;

  if (!state.tasks) state.tasks = [];

  let queued = 0;
  for (const work of workItems) {
    // Check if similar work already exists
    const exists = state.tasks.some(t => 
      t.title.toLowerCase().includes(work.title.toLowerCase().substring(0, 30))
    );

    if (exists) {
      log(`  ⏭️  Skipping "${work.title}" (already queued)`);
      continue;
    }

    // Create task
    const task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      title: work.title,
      description: work.description,
      assignedTo: work.assignedTo,
      status: 'briefing',
      briefing: work.briefing,
      priority: work.priority,
      pillar: work.pillar,
      createdAt: new Date().toISOString()
    };

    state.tasks.push(task);
    log(`  ✅ Queued: "${work.title}" → ${work.assignedTo}`);
    queued++;
  }

  if (queued > 0) {
    writeState(state);
    log(`📋 Queued ${queued} new task(s) for agent approval`);
  } else {
    log(`ℹ️  No new tasks to queue`);
  }

  return queued;
}

function main() {
  log('═════════════════════════════════════════════════════════════');
  log('🎯 ORCHESTRATOR — Strategic Work Generator');
  log('═════════════════════════════════════════════════════════════');
  log('');
  log('Analyzing mission progress and generating next work...');
  log('');

  // Analyze current state
  const progress = analyzeProgress();
  log(`📊 Current Progress:`);
  log(`  Completed: ${progress.completed}`);
  log(`  In-Progress: ${progress.in_progress}`);
  log(`  Queued: ${progress.queued}`);
  log('');

  // Generate next work
  log('🔍 Identifying next high-impact work...');
  const workQueue = generateNextWork();
  log(`Found ${workQueue.length} work item(s) to consider`);
  log('');

  // Queue work
  log('📝 Queuing work for agent execution...');
  const queued = queueWork(workQueue);

  log('');
  log('═════════════════════════════════════════════════════════════');
  log(`✨ Orchestration complete. ${queued} task(s) queued for approval.`);
  log('═════════════════════════════════════════════════════════════');
}

if (require.main === module) {
  main();
}

module.exports = { generateNextWork, queueWork, analyzeProgress };
