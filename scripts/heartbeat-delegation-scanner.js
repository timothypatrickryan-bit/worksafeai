#!/usr/bin/env node

/**
 * Heartbeat Delegation Scanner
 * 
 * Runs on every heartbeat to:
 * 1. Scan for new work (code changes, design needs, strategy decisions)
 * 2. Classify work automatically
 * 3. Delegate to best available agent
 * 4. Log delegations to Mission Control
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { classifyWork } = require('./work-classifier');
const { validateAgentForWork } = require('./agent-registry');

const WORKSPACE = process.env.WORKSPACE || path.join(process.env.HOME || '', '.openclaw', 'workspace');
const STATE_PATH = path.join(WORKSPACE, '.mission-control-state.json');
const LOG_PATH = path.join(WORKSPACE, '.delegation-log.json');

/**
 * Load mission control state
 */
function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return { agents: {}, inbox: [], delegations: [] };
  }
}

/**
 * Save mission control state
 */
function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

/**
 * Append to delegation log
 */
function logDelegation(delegation) {
  let log = [];
  try {
    log = JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
  } catch {}
  
  log.push({
    timestamp: new Date().toISOString(),
    ...delegation
  });
  
  // Keep last 100 delegations
  if (log.length > 100) {
    log = log.slice(-100);
  }
  
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), 'utf8');
}

/**
 * Check for code changes needing review
 */
function scanForCodeChanges() {
  const work = [];
  
  try {
    // Check git status in main repos
    const repos = [
      'apps/mission-control',
      'apps/consensus',
      'jtsa-backend',
      'jtsa-frontend'
    ];
    
    for (const repo of repos) {
      const repoPath = path.join(WORKSPACE, repo);
      if (!fs.existsSync(repoPath)) continue;
      
      try {
        const status = execSync(`cd ${repoPath} && git status --porcelain 2>/dev/null || true`, {
          encoding: 'utf8',
          timeout: 5000
        });
        
        if (status.trim()) {
          work.push({
            type: 'code_changes',
            source: repo,
            description: `Unreviewed code changes in ${repo}`,
            priority: 'high'
          });
        }
      } catch {}
    }
  } catch {}
  
  return work;
}

/**
 * Check for design work in project backlog
 */
function scanForDesignWork() {
  const work = [];
  
  try {
    // Check for .design-todo files or design-related issues
    const designTodos = findFilesMatching(WORKSPACE, /design.*todo|todo.*design/i);
    
    if (designTodos.length > 0) {
      work.push({
        type: 'design_work',
        source: 'project_backlog',
        description: 'Design work items found in backlog',
        priority: 'medium'
      });
    }
  } catch {}
  
  return work;
}

/**
 * Check for strategy decisions blocking other work
 */
function scanForStrategicWork() {
  const work = [];
  
  try {
    // Check for decision-needed files or strategy discussions
    const decisions = findFilesMatching(WORKSPACE, /decision|strategy|roadmap/i);
    
    if (decisions.length > 0) {
      work.push({
        type: 'strategy_work',
        source: 'decision_log',
        description: 'Strategic decisions needed',
        priority: 'medium'
      });
    }
  } catch {}
  
  return work;
}

/**
 * Simple file finder (replaces complex grep for now)
 */
function findFilesMatching(dir, pattern, maxDepth = 2, depth = 0) {
  const files = [];
  
  if (depth > maxDepth) return files;
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...findFilesMatching(fullPath, pattern, maxDepth, depth + 1));
      } else if (pattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch {}
  
  return files;
}

/**
 * Scan system health
 */
function scanSystemHealth() {
  const work = [];
  
  try {
    // Check if critical processes are running
    const requiredProcesses = ['node', 'cloudflared'];
    const psOutput = execSync('ps aux', { encoding: 'utf8', timeout: 5000 });
    
    for (const proc of requiredProcesses) {
      const isRunning = psOutput.includes(proc);
      if (!isRunning) {
        work.push({
          type: 'system_health',
          source: 'health_check',
          description: `Critical process missing: ${proc}`,
          priority: 'critical'
        });
      }
    }
  } catch {}
  
  return work;
}

/**
 * Check inbox for user-submitted work
 */
function scanInboxForWork() {
  const state = loadState();
  const work = [];
  
  for (const item of state.inbox || []) {
    if (item.status === 'ready-to-send' && item.delegatable) {
      work.push({
        type: 'user_request',
        source: 'inbox',
        description: item.message || item.description,
        inboxId: item.id,
        priority: item.priority || 'medium'
      });
    }
  }
  
  return work;
}

/**
 * Process discovered work and delegate
 */
function processAndDelegate(workItems) {
  const state = loadState();
  const delegations = [];
  
  for (const work of workItems) {
    // Classify the work
    const classification = classifyWork(work.description, { priority: work.priority });
    
    // Check if agent is available
    const primaryAgent = classification.recommendation.primaryAgent;
    const validation = validateAgentForWork(primaryAgent, classification.classification.category);
    
    if (!validation.valid) {
      console.log(`⚠️  Cannot delegate: ${validation.reason}`);
      continue;
    }
    
    // Create delegation record
    const delegation = {
      workId: `work_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workType: work.type,
      description: work.description,
      category: classification.classification.category,
      priority: classification.classification.priority,
      assignedAgent: primaryAgent,
      recommendedAlternatives: classification.alternatives.map(a => a.agentId),
      status: 'delegated',
      timestamp: new Date().toISOString()
    };
    
    // Update agent load in state
    if (!state.agents) state.agents = {};
    if (!state.agents[primaryAgent]) state.agents[primaryAgent] = { current_load: 0 };
    state.agents[primaryAgent].current_load = (state.agents[primaryAgent].current_load || 0) + 1;
    
    // Add to delegations list
    if (!state.delegations) state.delegations = [];
    state.delegations.push(delegation);
    
    delegations.push(delegation);
    logDelegation(delegation);
    
    console.log(`✅ Delegated to ${classification.recommendation.primaryAgentName}:`);
    console.log(`   Work: ${work.description}`);
    console.log(`   Category: ${classification.classification.categoryLabel}`);
    console.log(`   Priority: ${classification.classification.priority}`);
  }
  
  // Save updated state
  saveState(state);
  
  return delegations;
}

/**
 * Main scanner function
 */
function runDelegationScan() {
  console.log('═══════════════════════════════════════');
  console.log('🤖 HEARTBEAT DELEGATION SCAN');
  console.log('═══════════════════════════════════════\n');
  
  const allWork = [];
  
  // Scan for different work types
  console.log('🔍 Scanning for code changes...');
  allWork.push(...scanForCodeChanges());
  
  console.log('🔍 Scanning for design work...');
  allWork.push(...scanForDesignWork());
  
  console.log('🔍 Scanning for strategic work...');
  allWork.push(...scanForStrategicWork());
  
  console.log('🔍 Scanning system health...');
  allWork.push(...scanSystemHealth());
  
  console.log('🔍 Scanning inbox for delegatable work...');
  allWork.push(...scanInboxForWork());
  
  console.log(`\n📋 Found ${allWork.length} work items\n`);
  
  if (allWork.length === 0) {
    console.log('✅ No delegatable work found. System healthy.\n');
    return { summary: 'No work', delegations: [] };
  }
  
  // Process and delegate
  console.log('📤 Processing delegations...\n');
  const delegations = processAndDelegate(allWork);
  
  // Summary
  console.log('\n═══════════════════════════════════════');
  console.log('📊 DELEGATION SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`Total work items found: ${allWork.length}`);
  console.log(`Successfully delegated: ${delegations.length}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  if (delegations.length > 0) {
    console.log('\nDelegations:');
    for (const d of delegations) {
      console.log(`  • ${d.description} → ${d.assignedAgent}`);
    }
  }
  
  console.log('═══════════════════════════════════════\n');
  
  // ✅ UPDATE DASHBOARD STATE: Keep lastUpdate fresh
  const state = loadState();
  state.lastUpdate = new Date().toISOString();
  saveState(state);
  
  return {
    summary: `${delegations.length} delegations`,
    delegations
  };
}

// Run if called directly
if (require.main === module) {
  runDelegationScan();
}

module.exports = {
  runDelegationScan,
  scanForCodeChanges,
  scanForDesignWork,
  scanForStrategicWork,
  scanSystemHealth,
  scanInboxForWork,
  processAndDelegate,
  logDelegation
};
