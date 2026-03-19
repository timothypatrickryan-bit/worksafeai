#!/usr/bin/env node

/**
 * Lucy Task Automation
 * 
 * Watches for tasks assigned to Lucy, analyzes them, and delegates to subagents.
 * Runs as a heartbeat job to continuously monitor for new Lucy tasks.
 * 
 * Usage:
 *   node scripts/lucy-task-automation.js
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');
const LOG_FILE = path.join(WORKSPACE, '.lucy-automation.log');
const DELEGATIONS_FILE = path.join(WORKSPACE, '.lucy-delegations.json');

// Helper: read state file
function readState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { tasks: [] };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

// Helper: write state file
function writeState(state) {
  state.lastUpdate = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Helper: log activity
function log(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}`;
  console.log(logEntry);
  
  let logs = '';
  if (fs.existsSync(LOG_FILE)) {
    logs = fs.readFileSync(LOG_FILE, 'utf8');
  }
  fs.writeFileSync(LOG_FILE, logEntry + '\n' + logs.split('\n').slice(0, 99).join('\n'));
}

// Helper: read delegations history
function readDelegations() {
  if (!fs.existsSync(DELEGATIONS_FILE)) {
    return { delegations: [] };
  }
  return JSON.parse(fs.readFileSync(DELEGATIONS_FILE, 'utf8'));
}

// Helper: save delegation
function saveDelegation(delegation) {
  const delegations = readDelegations();
  delegations.delegations.push({
    ...delegation,
    createdAt: new Date().toISOString(),
  });
  fs.writeFileSync(DELEGATIONS_FILE, JSON.stringify(delegations, null, 2));
}

// Match agent to work based on task classification
function findBestAgent(taskDescription, taskCategory, executionTeam) {
  const scores = {};
  
  executionTeam.forEach(agent => {
    scores[agent.id] = calculateMatchScore(taskDescription, taskCategory, agent);
  });
  
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  
  // Find the actual agent object, not just the ID
  const bestAgentId = sorted[0][0];
  const bestAgent = executionTeam.find(a => a.id === bestAgentId);
  
  return [bestAgent, sorted[0][1]];
}

// Calculate match score (0-10) for an agent
function calculateMatchScore(taskDescription, category, agent) {
  let score = 5; // baseline
  
  const desc = taskDescription.toLowerCase();
  const specialty = (agent.specialty || '').toLowerCase();
  const title = (agent.title || '').toLowerCase();
  
  // Category-based scoring
  switch (category) {
    case 'design':
      if (title.includes('designer') || specialty.includes('design')) score += 3;
      break;
    case 'development':
      if (title.includes('developer') || specialty.includes('development')) score += 3;
      break;
    case 'research':
      if (title.includes('research') || specialty.includes('research')) score += 3;
      break;
    case 'strategy':
      if (title.includes('strategy') || specialty.includes('strategy')) score += 3;
      break;
    case 'security':
      if (title.includes('security') || specialty.includes('security')) score += 3;
      break;
    case 'quality':
      if (title.includes('qa') || title.includes('test') || specialty.includes('quality')) score += 3;
      break;
  }
  
  // Keyword matching in description
  const keywords = specialty.split(' ').filter(w => w.length > 3);
  keywords.forEach(keyword => {
    if (desc.includes(keyword)) score += 1;
  });
  
  return Math.min(score, 10); // Cap at 10
}

// Classify task into category
function classifyTask(description) {
  const desc = description.toLowerCase();
  
  // Check for business/growth/strategy first (before design)
  if (desc.includes('grow') || desc.includes('growth') || desc.includes('business') || 
      desc.includes('market') || desc.includes('expand') || desc.includes('opportunity') ||
      desc.includes('strategy') || desc.includes('plan') || desc.includes('positioning') ||
      desc.includes('northeast') || desc.includes('upstate')) {
    return 'strategy';
  }
  if (desc.includes('research') || desc.includes('analysis') || desc.includes('investigate') ||
      desc.includes('competitor') || desc.includes('trend') || desc.includes('data center')) {
    return 'research';
  }
  if (desc.includes('design') || desc.includes('ui') || desc.includes('ux') || desc.includes('mockup')) {
    return 'design';
  }
  if (desc.includes('develop') || desc.includes('code') || desc.includes('build') || desc.includes('api')) {
    return 'development';
  }
  if (desc.includes('security') || desc.includes('audit') || desc.includes('review')) {
    return 'security';
  }
  if (desc.includes('test') || desc.includes('qa') || desc.includes('quality')) {
    return 'quality';
  }
  
  return 'general';
}

// Break down task into subtasks for delegation
function analyzeTask(task, executionTeam) {
  const category = classifyTask(task.description);
  const [bestAgent, score] = findBestAgent(task.description, category, executionTeam);
  
  // Validate agent found
  if (!bestAgent) {
    log(`❌ ERROR: No agent found for task "${task.title}"`);
    return null;
  }
  
  // Create delegation plan
  const plan = {
    taskId: task.id,
    title: task.title,
    description: task.description,
    category: category,
    primaryAgent: {
      id: bestAgent.id,
      name: bestAgent.name,
      title: bestAgent.title,
      matchScore: score,
      reason: `Best match for ${category} work (specializes in ${bestAgent.specialty || 'general'})`,
    },
    subtasks: [],
    status: 'planned',
  };
  
  // For complex tasks, identify if secondary agents needed
  if (bestAgent.id === 'jarvis') {
    // Development tasks might need design/security review
    const designAgent = executionTeam.find(a => a.title && a.title.includes('Designer'));
    const securityAgent = executionTeam.find(a => a.id === 'opus');
    
    if (designAgent) {
      plan.subtasks.push({
        phase: 'Design Review',
        agent: designAgent.id,
        dependsOn: [],
        description: 'Review design requirements',
      });
    }
    
    if (securityAgent) {
      plan.subtasks.push({
        phase: 'Security Review',
        agent: securityAgent.id,
        dependsOn: ['development'],
        description: 'Audit code for security vulnerabilities',
      });
    }
  }
  
  return plan;
}

// Main automation function
function processLucyTasks() {
  const state = readState();
  
  // Find tasks assigned to Lucy that are in 'queued' state
  const lucyTasks = (state.tasks || []).filter(
    t => t.assignedTo === 'lucy' && (t.status === 'queued' || t.status === 'pending')
  );
  
  if (lucyTasks.length === 0) {
    log('✅ No Lucy tasks to process');
    return;
  }
  
  log(`🎯 Found ${lucyTasks.length} Lucy task(s) to process`);
  
  // Get execution team
  const executionTeam = (state.team?.members || []).filter(
    m => m.team === 'Execution' || (state.team?.structure?.execution || []).includes(m.id)
  );
  
  lucyTasks.forEach(task => {
    log(`📋 Processing task: ${task.title}`);
    
    // Analyze and create delegation plan
    const plan = analyzeTask(task, executionTeam);
    
    // Skip if analysis failed
    if (!plan) {
      log(`⚠️  Skipped task "${task.title}" - analysis failed`);
      return;
    }
    
    log(`📊 Analysis: Category=${plan.category}, Primary=${plan.primaryAgent.name} (${plan.primaryAgent.matchScore}/10)`);
    
    // Update task status
    task.status = 'in-progress';
    task.lucyPlan = plan;
    task.lucyAnalyzedAt = new Date().toISOString();
    
    // Save delegation record
    saveDelegation(plan);
    
    // Create delegation for primary agent
    if (!state.delegations) state.delegations = [];
    
    const delegation = {
      id: `d_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      workDescription: task.description,
      category: plan.category,
      priority: task.priority || 'medium',
      assignedAgent: plan.primaryAgent.id,
      assignedAgentName: plan.primaryAgent.name,
      matchScore: plan.primaryAgent.matchScore.toFixed(2),
      status: 'delegated',
      createdAt: new Date().toISOString(),
      linkedTask: task.id,
    };
    
    state.delegations.push(delegation);
    
    log(`✅ Delegated to ${plan.primaryAgent.name} (delegation: ${delegation.id})`);
    
    // Add activity event
    if (!state.activity) state.activity = [];
    state.activity.unshift({
      type: 'delegation',
      title: `Lucy delegated "${task.title}" to ${plan.primaryAgent.name}`,
      description: plan.primaryAgent.reason,
      timestamp: new Date().toISOString(),
    });
  });
  
  // Write updated state
  writeState(state);
  log(`✅ Completed processing ${lucyTasks.length} task(s)`);
}

// Run automation
try {
  log('🚀 Starting Lucy Task Automation');
  processLucyTasks();
  log('✅ Lucy automation complete');
} catch (err) {
  log(`❌ Error: ${err.message}`);
  console.error(err);
  process.exit(1);
}
