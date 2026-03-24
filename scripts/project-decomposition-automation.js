#!/usr/bin/env node

/**
 * Project Decomposition Automation
 * 
 * Input: Project ID (command line argument)
 * Process:
 *   1. Load project from state file
 *   2. Parse description/statement of work
 *   3. Break into phases & milestones
 *   4. Generate orchestratorPlan with objectives, phases, timeline, metrics
 *   5. Create discrete tasks from phases
 *   6. Queue tasks for execution
 *   7. Brief Tim on plan
 * Output: Updated project with full plan + queued tasks
 * 
 * Runtime: 3-5 minutes per project
 * 
 * Usage: node project-decomposition-automation.js <projectId>
 */

const fs = require('fs');
const path = require('path');

const projectId = process.argv[2];
if (!projectId) {
  console.error('Usage: node project-decomposition-automation.js <projectId>');
  process.exit(1);
}

const WORKSPACE = path.join(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');
const AUTONOMY_LOG = path.join(WORKSPACE, '.autonomy-log.txt');

function log(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(AUTONOMY_LOG, logEntry);
  console.log(logEntry);
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (err) {
    console.error(`Failed to read state file: ${err.message}`);
    return null;
  }
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error(`Failed to save state file: ${err.message}`);
    return false;
  }
  return true;
}

function extractObjectives(description) {
  // Parse first sentence/goal from description
  if (!description) return [];
  const sentences = description.split(/[.!?]/);
  return sentences.filter(s => s.trim().length > 0).slice(0, 2).map(s => s.trim());
}

function extractConstraints(description) {
  // Look for timeline, deadline, or resource constraints in description
  const constraints = {};
  if (description.includes('weekly')) constraints.frequency = 'weekly';
  if (description.includes('Friday')) constraints.day = 'Friday';
  if (description.includes('daily')) constraints.frequency = 'daily';
  if (description.match(/\d+\s*(hours?|days?|weeks?|months?)/)) {
    constraints.timeline = description.match(/\d+\s*(hours?|days?|weeks?|months?)/)[0];
  }
  return constraints;
}

/**
 * Phase 1 Improvement #4: Complexity Assessment
 * Analyzes project description to assess complexity
 * Returns complexity score (1-2) which determines phase count
 */
function assessComplexity(description) {
  let complexity = 1; // baseline (simple)
  
  const complexityFactors = {
    'integrate': 1.5,
    'integration': 1.5,
    'api': 1.5,
    'refactor': 1.8,
    'redesign': 1.5,
    'scale': 1.8,
    'scalable': 1.8,
    'performance': 1.3,
    'optimize': 1.3,
    'security': 1.8,
    'migrate': 1.8,
    'infrastructure': 1.5,
    'architecture': 1.5,
    'multi-': 1.5,
    'cross-': 1.5,
    'third-party': 1.3,
    'external': 1.3
  };
  
  const descLower = description.toLowerCase();
  
  // Find highest complexity factor
  for (const [factor, score] of Object.entries(complexityFactors)) {
    if (descLower.includes(factor)) {
      complexity = Math.max(complexity, score);
    }
  }
  
  return complexity;
}

/**
 * Phase 1 Improvement #2: Project Type Classification
 * Detects project type from description keywords
 * Returns: 'analysis', 'feature', 'automation', 'infrastructure', 'integration', 'generic'
 */
function classifyProjectType(description) {
  const descLower = description.toLowerCase();
  
  const typeKeywords = {
    analysis: ['analyze', 'analysis', 'research', 'market', 'data', 'report', 'insight', 'review'],
    automation: ['automate', 'automation', 'cron', 'pipeline', 'schedule', 'workflow', 'recurring'],
    feature: ['build', 'feature', 'develop', 'implement', 'create', 'new', 'app'],
    integration: ['integrate', 'integration', 'api', 'connect', 'sync', 'plugin'],
    infrastructure: ['infrastructure', 'setup', 'deploy', 'configure', 'devops', 'deployment'],
    optimization: ['optimize', 'optimize', 'performance', 'improve', 'refactor', 'upgrade']
  };
  
  const scores = {};
  for (const [type, keywords] of Object.entries(typeKeywords)) {
    const matchCount = keywords.filter(k => descLower.includes(k)).length;
    scores[type] = matchCount;
  }
  
  const classified = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return classified[0]?.[0] || 'generic';
}

function generatePhases(description, objectives) {
  // Phase 1 Improvements #2 & #4: Detect type + assess complexity
  const projectType = classifyProjectType(description);
  const complexity = assessComplexity(description);
  const phases = [];
  
  // Determine phase count based on complexity (Phase 1 #4)
  const phaseCount = complexity >= 1.5 ? 5 : 3;
  
  // Generate type-specific phases (Phase 1 #2)
  if (projectType === 'analysis') {
    phases.push({
      name: 'Research Framework Setup',
      description: 'Identify qualified sources, establish methodology, define metrics',
      estimatedDays: 0.5,
      priority: 'critical',
      deliverables: ['Source list', 'Methodology', 'Analysis template']
    });
    phases.push({
      name: 'Analysis & Content Creation',
      description: 'Research thoroughly, synthesize findings, create insights',
      estimatedDays: 1.5,
      priority: 'high',
      deliverables: ['Analysis document', 'Sourced insights', 'Professional formatting']
    });
    phases.push({
      name: 'Reporting & Delivery',
      description: 'Final review, formatting, delivery',
      estimatedDays: 0.5,
      priority: 'high',
      deliverables: ['Final report', 'Delivery confirmation']
    });
  } else if (projectType === 'automation') {
    phases.push({
      name: 'Design Pipeline & Architecture',
      description: 'Plan workflow, define data structures, design automation flow',
      estimatedDays: 0.5,
      priority: 'critical',
      deliverables: ['Pipeline design', 'Specifications', 'Data model']
    });
    phases.push({
      name: 'Implementation',
      description: 'Build automation, integrate components, configure scheduling',
      estimatedDays: 1,
      priority: 'high',
      deliverables: ['Working automation', 'Cron config', 'Integration tested']
    });
    phases.push({
      name: 'Testing, Deployment & Documentation',
      description: 'End-to-end testing, deploy to production, document process',
      estimatedDays: 0.5,
      priority: 'high',
      deliverables: ['Test results', 'Deployment complete', 'Operations docs']
    });
  } else if (projectType === 'feature') {
    phases.push({
      name: 'Design & Architecture',
      description: 'Define specifications, design UI/UX, technical architecture',
      estimatedDays: 1,
      priority: 'critical',
      deliverables: ['Specification doc', 'Design mockups', 'Architecture diagram']
    });
    
    if (complexity >= 1.5) {
      // Complex features get prototype phase
      phases.push({
        name: 'Prototype & Validation',
        description: 'Build prototype, validate approach, get feedback',
        estimatedDays: 1,
        priority: 'high',
        deliverables: ['Working prototype', 'Feedback log', 'Decision log']
      });
    }
    
    phases.push({
      name: 'Development',
      description: 'Implement feature, unit testing, code review',
      estimatedDays: 2,
      priority: 'high',
      deliverables: ['Feature code', 'Test suite', 'Code review passed']
    });
    phases.push({
      name: 'Testing & QA',
      description: 'Integration testing, edge cases, performance testing',
      estimatedDays: 1,
      priority: 'high',
      deliverables: ['QA report', 'Bug fixes', 'Performance verified']
    });
    phases.push({
      name: 'Deployment & Monitoring',
      description: 'Deploy to production, monitor for issues, documentation',
      estimatedDays: 0.5,
      priority: 'high',
      deliverables: ['Deployment complete', 'Monitoring setup', 'User docs']
    });
  } else if (projectType === 'integration') {
    phases.push({
      name: 'Interface Design & Planning',
      description: 'Design integration points, API contracts, data mapping',
      estimatedDays: 0.5,
      priority: 'critical',
      deliverables: ['Integration design', 'API specification', 'Data mapping']
    });
    phases.push({
      name: 'Implementation & Testing',
      description: 'Build integration, test data flow, error handling',
      estimatedDays: 1.5,
      priority: 'high',
      deliverables: ['Integration code', 'Test results', 'Error handling']
    });
    phases.push({
      name: 'Documentation & Deployment',
      description: 'Document integration, deploy, monitor connectivity',
      estimatedDays: 0.5,
      priority: 'high',
      deliverables: ['Integration docs', 'Deployment verified', 'Monitoring setup']
    });
  } else {
    // Generic/fallback decomposition
    phases.push({
      name: 'Planning & Design',
      description: 'Define architecture, create plan, identify requirements',
      estimatedDays: 1,
      priority: 'critical',
      deliverables: ['Project plan', 'Architecture doc', 'Success criteria']
    });
    
    if (complexity >= 1.5) {
      phases.push({
        name: 'Architecture & Prototyping',
        description: 'Deep dive on architecture, prototype core components',
        estimatedDays: 1.5,
        priority: 'high',
        deliverables: ['Detailed architecture', 'Working prototype']
      });
    }
    
    phases.push({
      name: 'Development & Implementation',
      description: 'Build core functionality, integrate components',
      estimatedDays: 2,
      priority: 'high',
      deliverables: ['Working implementation', 'Code/documentation', 'Internal testing']
    });
    phases.push({
      name: 'Testing & Deployment',
      description: 'Quality assurance, validation, production deployment',
      estimatedDays: 1,
      priority: 'high',
      deliverables: ['Test results', 'Deployment guide', 'Live production']
    });
  }
  
  return phases;
}

function estimateTimeline(phases) {
  const totalDays = phases.reduce((sum, p) => sum + (p.estimatedDays || 0), 0);
  
  if (totalDays <= 0.5) return '< 1 day';
  if (totalDays <= 1) return '1 day';
  if (totalDays <= 2) return '2 days';
  if (totalDays <= 3.5) return '3-4 days';
  if (totalDays <= 7) return '1 week';
  return `${Math.ceil(totalDays / 5)} weeks`;
}

function defineMetrics(objectives) {
  // Define success metrics based on objectives
  return [
    'All deliverables completed and reviewed',
    'Quality standards met (per project requirements)',
    'Timeline within estimate',
    'Stakeholder approval obtained',
    'Production-ready or deployed'
  ];
}

function generateTasksFromPhases(project, phases) {
  const tasks = [];
  let taskOrder = 1;
  
  for (const phase of phases) {
    const taskId = `task-${project.id}-phase-${taskOrder}`;
    const task = {
      id: taskId,
      projectId: project.id,
      title: phase.name,
      description: phase.description,
      status: 'queued',
      priority: phase.priority === 'critical' ? 1 : phase.priority === 'high' ? 2 : 3,
      createdAt: new Date().toISOString(),
      phase: phase.name,
      briefing: {
        executionPlan: {
          deliverables: phase.deliverables,
          timeline: {
            estimatedDays: phase.estimatedDays
          },
          successCriteria: [
            { type: 'Completion', description: 'All deliverables completed' },
            { type: 'Quality', description: 'Quality standards met' }
          ]
        }
      }
    };
    tasks.push(task);
    taskOrder++;
  }
  
  return tasks;
}

function main() {
  try {
    log(`🚀 [DECOMPOSING] PROJECT: ${projectId}`);
    
    // Load state
    const state = readState();
    if (!state) {
      log(`❌ Failed to read state file`);
      process.exit(1);
    }
    
    // Find project
    const project = state.projects.find(p => p.id === projectId);
    if (!project) {
      log(`❌ Project not found: ${projectId}`);
      process.exit(1);
    }
    
    log(`📋 Project: ${project.name}`);
    log(`   Description: ${project.description.substring(0, 80)}...`);
    
    // Step 1: Parse description & classify (Phase 1 Improvements #2 & #4)
    log(`\n1️⃣  PARSING STATEMENT OF WORK & CLASSIFYING PROJECT`);
    const objectives = extractObjectives(project.description);
    const constraints = extractConstraints(project.description);
    const projectType = classifyProjectType(project.description);
    const complexity = assessComplexity(project.description);
    log(`   Objectives: ${objectives[0]}`);
    log(`   Type: ${projectType} | Complexity: ${complexity >= 1.5 ? 'HIGH' : 'NORMAL'}`);
    log(`   Constraints: ${JSON.stringify(constraints)}`);
    
    // Step 2: Generate type-specific phases (Phase 1 Improvements #2 & #4)
    log(`\n2️⃣  GENERATING TYPE-SPECIFIC PHASES`);
    const phases = generatePhases(project.description, objectives);
    log(`   Phases: ${phases.length}`);
    phases.forEach((p, i) => {
      log(`   ${i+1}. ${p.name} (~${p.estimatedDays} days)`);
    });
    
    // Step 3: Estimate timeline
    log(`\n3️⃣  ESTIMATING TIMELINE`);
    const timeline = estimateTimeline(phases);
    log(`   Timeline: ${timeline}`);
    
    // Step 4: Define metrics
    log(`\n4️⃣  DEFINING SUCCESS METRICS`);
    const metrics = defineMetrics(objectives);
    metrics.forEach(m => log(`   ✓ ${m}`));
    
    // Step 5: Generate orchestratorPlan
    log(`\n5️⃣  GENERATING ORCHESTRATOR PLAN`);
    project.orchestratorPlan = {
      objective: objectives[0] || project.name,
      phases: phases.map(p => ({
        name: p.name,
        description: p.description,
        estimatedDays: p.estimatedDays,
        deliverables: p.deliverables
      })),
      timeline: timeline,
      metrics: metrics
    };
    log(`   ✅ Plan generated with ${phases.length} phases`);
    
    // Step 6: Create tasks
    log(`\n6️⃣  CREATING DISCRETE TASKS`);
    const tasks = generateTasksFromPhases(project, phases);
    log(`   Tasks created: ${tasks.length}`);
    
    // Step 7: Queue tasks
    log(`\n7️⃣  QUEUEING TASKS FOR EXECUTION`);
    state.tasks.push(...tasks);
    tasks.forEach((t, i) => {
      log(`   ${i+1}. ${t.title} [P${t.priority}]`);
    });
    
    // Step 8: Save updated state
    log(`\n8️⃣  SAVING STATE`);
    if (saveState(state)) {
      log(`   ✅ State file updated`);
    } else {
      log(`   ❌ Failed to save state`);
      process.exit(1);
    }
    
    // Step 9: Summary
    log(`\n✅ PROJECT DECOMPOSITION COMPLETE`);
    log(`   Project: ${project.name}`);
    log(`   Phases: ${phases.length}`);
    log(`   Tasks queued: ${tasks.length}`);
    log(`   Timeline: ${timeline}`);
    log(`   Next: Tasks will be auto-briefed and agents assigned`);
    
  } catch (error) {
    log(`❌ ERROR: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main();
