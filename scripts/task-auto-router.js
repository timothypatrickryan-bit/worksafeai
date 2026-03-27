#!/usr/bin/env node

/**
 * Task Auto-Router — Intelligent Task Assignment Engine
 * 
 * Purpose: Automatically route queued tasks to the best-fit agent
 * based on task type, complexity, agent expertise, and current availability.
 * 
 * Scoring Algorithm:
 * 1. Identify task category (research, development, qa, architecture, etc.)
 * 2. Get matching agents for that category
 * 3. Score each agent: (expertise * category_weight) + (availability_factor)
 * 4. Assign to highest-scoring agent if score >= 7
 * 5. Log assignment + reasoning
 * 
 * Integration: Called by autonomy-heartbeat.js every 30 minutes
 * 
 * Files Modified:
 * - .mission-control-state.json (task.assignedAgent, task.autoRoutedAt)
 * - .autonomy-log.txt (routing decisions + reasoning)
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');
const EXPERTISE_FILE = path.join(WORKSPACE, 'AGENT_EXPERTISE_MATRIX.md');
const AUTONOMY_LOG = path.join(WORKSPACE, '.autonomy-log.txt');

/**
 * Agent expertise baseline (extracted from AGENT_EXPERTISE_MATRIX.md)
 */
const EXPERTISE = {
  scout: {
    'market research': 9,
    'competitive analysis': 9,
    'company research': 8,
    'data collection': 9,
    'industry analysis': 8,
    'technical research': 6,
    'content creation': 5,
  },
  velma: {
    'code review': 9,
    'testing': 9,
    'qa gating': 9,
    'bug diagnosis': 8,
    'security testing': 7,
    'performance testing': 7,
  },
  chief: {
    'system architecture': 9,
    'full-stack development': 8,
    'database design': 8,
    'api design': 8,
    'backend development': 8,
    'frontend development': 7,
  },
  johnny: {
    'full-stack development': 8,
    'frontend development': 8,
    'backend development': 8,
    'database queries': 7,
    'testing': 6,
    'ui/ux implementation': 7,
  },
  laura: {
    'brand strategy': 9,
    'product positioning': 9,
    'market positioning': 8,
    'competitive positioning': 8,
    'content strategy': 8,
    'go-to-market': 7,
  },
  opus: {
    'deep reasoning': 10,
    'complex problem-solving': 10,
    'code review (complex)': 9,
    'security architecture': 8,
    'system design': 9,
    'algorithm design': 8,
  },
  jarvis: {
    'infrastructure setup': 8,
    'ci/cd configuration': 8,
    'monitoring': 7,
    'backup/recovery': 7,
    'script automation': 8,
  },
};

/**
 * Task type → primary agent mapping
 */
const TASK_ROUTING_MATRIX = {
  'research': {
    primary: 'scout',
    secondary: ['johnny', 'chief'],
    skills: ['market research', 'competitive analysis', 'company research', 'data collection'],
  },
  'feature-implementation': {
    primary: 'johnny',
    secondary: ['chief', 'velma'],
    skills: ['full-stack development', 'frontend development', 'backend development'],
  },
  'bug-fix': {
    primary: 'johnny',
    secondary: ['velma', 'chief'],
    skills: ['bug diagnosis', 'testing', 'full-stack development'],
  },
  'code-review': {
    primary: 'velma',
    secondary: ['opus', 'johnny'],
    skills: ['code review', 'testing', 'qa gating'],
  },
  'qa-testing': {
    primary: 'velma',
    secondary: ['johnny'],
    skills: ['testing', 'qa gating', 'bug diagnosis'],
  },
  'architecture-design': {
    primary: 'chief',
    secondary: ['opus', 'johnny'],
    skills: ['system architecture', 'api design', 'database design'],
  },
  'complex-problem': {
    primary: 'opus',
    secondary: ['chief'],
    skills: ['deep reasoning', 'complex problem-solving', 'system design'],
  },
  'strategy': {
    primary: 'laura',
    secondary: ['scout'],
    skills: ['brand strategy', 'product positioning', 'market positioning'],
  },
  'infrastructure': {
    primary: 'jarvis',
    secondary: ['chief'],
    skills: ['infrastructure setup', 'ci/cd configuration', 'monitoring'],
  },
};

// Track agent availability
const AGENT_CAPACITY = {
  scout: { max: 4, baseCost: 0.01 },
  velma: { max: 3, baseCost: 0.01 },
  chief: { max: 3, baseCost: 0.01 },
  johnny: { max: 4, baseCost: 0.01 },
  laura: { max: 3, baseCost: 0.01 },
  opus: { max: 2, baseCost: 1.0 },  // Expensive, reserve for complex only
  jarvis: { max: 3, baseCost: 0.01 },
};

function readState() {
  try {
    const content = fs.readFileSync(STATE_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading state: ${err.message}`);
    return { agents: {}, tasks: [] };
  }
}

function writeState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error(`Error writing state: ${err.message}`);
  }
}

function log(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] 🤖 AUTO-ROUTER: ${message}\n`;
  fs.appendFileSync(AUTONOMY_LOG, entry);
  console.log(entry.trim());
}

/**
 * Normalize task type (convert user input to canonical form)
 */
function normalizeTaskType(userType) {
  const typeMap = {
    'research': 'research',
    'competitive analysis': 'research',
    'market research': 'research',
    'company research': 'research',
    'development': 'feature-implementation',
    'feature': 'feature-implementation',
    'feature-implementation': 'feature-implementation',
    'implementation': 'feature-implementation',
    'code': 'feature-implementation',
    'bug': 'bug-fix',
    'bug-fix': 'bug-fix',
    'review': 'code-review',
    'code-review': 'code-review',
    'qa': 'qa-testing',
    'qa-testing': 'qa-testing',
    'testing': 'qa-testing',
    'architecture': 'architecture-design',
    'architecture-design': 'architecture-design',
    'design': 'architecture-design',
    'complex': 'complex-problem',
    'complex-problem': 'complex-problem',
    'problem-solving': 'complex-problem',
    'strategy': 'strategy',
    'positioning': 'strategy',
    'branding': 'strategy',
    'infrastructure': 'infrastructure',
    'devops': 'infrastructure',
    'ci/cd': 'infrastructure',
  };
  
  const lower = (userType || 'feature-implementation').toLowerCase();
  return typeMap[lower] || 'feature-implementation';
}

/**
 * Calculate agent utilization (current_tasks / max_capacity)
 */
function getAgentUtilization(state, agentName) {
  if (!state.agents || !state.agents[agentName]) return 0;
  
  const assigned = state.tasks.filter(t => 
    t.assignedAgent === agentName && 
    t.status !== 'complete' && 
    t.status !== 'cancelled'
  ).length;
  
  const capacity = AGENT_CAPACITY[agentName]?.max || 3;
  return assigned / capacity;
}

/**
 * Calculate agent availability score (0-1, higher = more available)
 */
function getAvailabilityScore(state, agentName) {
  const utilization = getAgentUtilization(state, agentName);
  return Math.max(0, 1 - utilization);
}

/**
 * Score a single agent for a given task
 * Returns score 0-10 (>= 7 means auto-route eligible)
 */
function scoreAgentForTask(agent, task, state, isSecondary = false) {
  const routeInfo = TASK_ROUTING_MATRIX[task.type];
  if (!routeInfo) {
    log(`⚠️  Unknown task type: ${task.type} — defaulting to feature-implementation`);
    return scoreAgentForTask(agent, { ...task, type: 'feature-implementation' }, state, isSecondary);
  }
  
  const agentExpertise = EXPERTISE[agent] || {};
  const taskSkills = routeInfo.skills || [];
  
  // Base expertise score (average across required skills)
  let expertiseScore = 0;
  if (taskSkills.length > 0) {
    expertiseScore = taskSkills.reduce((sum, skill) => {
      return sum + (agentExpertise[skill] || 3);  // Default 3 if not found
    }, 0) / taskSkills.length;
  } else {
    expertiseScore = 5;  // Neutral if no specific skills
  }
  
  // Availability score (0-1)
  const availabilityScore = getAvailabilityScore(state, agent);
  
  // Role fit bonus (primary gets +1, secondary gets +0.5)
  let roleBonus = 0;
  if (routeInfo.primary === agent) {
    roleBonus = 1;
  } else if (routeInfo.secondary && routeInfo.secondary.includes(agent)) {
    roleBonus = 0.5;
  }
  
  // Complexity adjustment for Opus (only route high-complexity tasks)
  let complexityAdjustment = 0;
  if (agent === 'opus') {
    if (task.complexity >= 8) {
      complexityAdjustment = 2;  // Bonus for high-complexity
    } else {
      return 2;  // Very low score for low-complexity (preserve Opus for expensive tasks)
    }
  }
  
  // Secondary penalty (reduce secondary agent scores)
  const secondaryPenalty = isSecondary ? -1 : 0;
  
  // Final score = (expertise * 0.5) + (availability * 2) + roleBonus + complexityAdjustment
  const finalScore = Math.min(10, 
    (expertiseScore * 0.4) + 
    (availabilityScore * 3) + 
    roleBonus + 
    complexityAdjustment + 
    secondaryPenalty
  );
  
  return Math.max(0, finalScore);
}

/**
 * Find best agent for a task
 * Returns { agent: string, score: number, reasoning: string }
 */
function findBestAgent(task, state) {
  const routeInfo = TASK_ROUTING_MATRIX[task.type];
  if (!routeInfo) {
    return null;  // Unknown task type
  }
  
  // Score primary agent
  const primaryAgent = routeInfo.primary;
  const primaryScore = scoreAgentForTask(primaryAgent, task, state, false);
  
  let bestAgent = primaryAgent;
  let bestScore = primaryScore;
  let reasoning = `Primary agent: ${primaryAgent} (score: ${primaryScore.toFixed(1)})`;
  
  // Score secondary agents if primary score is low
  if (primaryScore < 8 && routeInfo.secondary) {
    for (const secondaryAgent of routeInfo.secondary) {
      const secondaryScore = scoreAgentForTask(secondaryAgent, task, state, true);
      if (secondaryScore > bestScore) {
        bestScore = secondaryScore;
        bestAgent = secondaryAgent;
        reasoning = `Secondary agent: ${secondaryAgent} (score: ${secondaryScore.toFixed(1)}), primary was ${primaryScore.toFixed(1)}`;
      }
    }
  }
  
  return {
    agent: bestAgent,
    score: bestScore,
    reasoning,
  };
}

/**
 * Auto-route a single task
 * Returns true if successfully routed, false otherwise
 */
function routeTask(task, state) {
  if (!task || !task.id) return false;
  if (task.assignedAgent) return false;  // Already assigned
  if (task.status !== 'queued') return false;  // Not queued
  
  // Normalize task type
  const normalizedType = normalizeTaskType(task.type);
  
  // Find best agent
  const result = findBestAgent({ ...task, type: normalizedType }, state);
  if (!result || result.score < 7) {
    log(`❌ No suitable agent for task ${task.id} (${normalizedType}): score ${result?.score?.toFixed(1) || 'N/A'} < 7`);
    return false;
  }
  
  // Assign task
  task.assignedAgent = result.agent;
  task.autoRoutedAt = new Date().toISOString();
  task.routingReason = result.reasoning;
  task.status = 'assigned';
  
  log(`✅ Task ${task.id} → ${result.agent} (${normalizedType}, score: ${result.score.toFixed(1)})`);
  log(`   Reason: ${result.reasoning}`);
  
  return true;
}

/**
 * Main: Find all queued tasks and auto-route them
 */
function runAutoRouter() {
  const state = readState();
  if (!state || !state.tasks) {
    log(`⚠️  No tasks found in state`);
    return { totalQueued: 0, routed: 0, failed: 0, state: {} };
  }
  
  const queuedTasks = state.tasks.filter(t => t.status === 'queued');
  if (queuedTasks.length === 0) {
    log(`ℹ️  No queued tasks to route`);
    return { totalQueued: 0, routed: 0, failed: 0, state };
  }
  
  log(`🔄 Auto-routing ${queuedTasks.length} queued task(s)...`);
  
  let routed = 0;
  let failed = 0;
  
  for (const task of queuedTasks) {
    const success = routeTask(task, state);
    if (success) {
      routed++;
    } else {
      failed++;
    }
  }
  
  // Save updated state
  writeState(state);
  
  log(`📊 Auto-routing complete: ${routed} routed, ${failed} failed/pending manual triage`);
  
  return {
    totalQueued: queuedTasks.length,
    routed,
    failed: failed,
    state,
  };
}

// Export for use in autonomy-heartbeat
module.exports = {
  runAutoRouter,
  routeTask,
  scoreAgentForTask,
  normalizeTaskType,
  TASK_ROUTING_MATRIX,
  EXPERTISE,
};

// Allow direct execution
if (require.main === module) {
  const result = runAutoRouter();
  process.exit(result.failed > 0 ? 1 : 0);
}
