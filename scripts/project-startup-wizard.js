#!/usr/bin/env node

/**
 * Project Startup Wizard
 * 
 * When a new project is created, automatically:
 * 1. Detect project type and complexity
 * 2. Generate phase-based briefings
 * 3. Create initial task breakdown
 * 4. Assign to appropriate agents
 * 5. Set up timeline and milestones
 */

const fs = require('fs');
const path = require('path');

// Smart project type detection
function detectProjectType(description) {
  const desc = description.toLowerCase();
  
  // Design/UI projects
  if (desc.includes('design') || desc.includes('ui') || desc.includes('wireframe') || desc.includes('mockup')) {
    return 'design';
  }
  
  // Development/Backend projects
  if (desc.includes('api') || desc.includes('backend') || desc.includes('database') || desc.includes('build') || desc.includes('develop')) {
    return 'development';
  }
  
  // Research projects
  if (desc.includes('research') || desc.includes('analysis') || desc.includes('market') || desc.includes('competitive')) {
    return 'research';
  }
  
  // Strategy/Business projects
  if (desc.includes('strategy') || desc.includes('plan') || desc.includes('business') || desc.includes('growth')) {
    return 'strategy';
  }
  
  // Infrastructure/DevOps
  if (desc.includes('infrastructure') || desc.includes('deploy') || desc.includes('devops') || desc.includes('system')) {
    return 'infrastructure';
  }
  
  // Testing/QA
  if (desc.includes('test') || desc.includes('qa') || desc.includes('quality')) {
    return 'testing';
  }
  
  // Default to product (fullstack)
  return 'product';
}

// Generate phases based on project type (AI VELOCITY - hours/days, not weeks)
// Timelines are compressed 5-10x from human pace and account for parallel execution
function generatePhases(projectType, projectName) {
  const phases = {
    design: [
      { name: 'Concept & Wireframes', duration: '4 hours', briefing: `Design phase 1: Create concept sketches and wireframes for ${projectName}` },
      { name: 'High-Fidelity Design', duration: '4 hours', briefing: `Design phase 2: Develop high-fidelity mockups and design specifications` },
      { name: 'Design System', duration: '2 hours', briefing: `Design phase 3: Create design system, component library, and brand guidelines` },
      { name: 'Handoff & Specs', duration: '1 hour', briefing: `Design phase 4: Prepare design specs and documentation for development handoff` },
      { name: 'Validation & Iteration', duration: '4 hours', briefing: `Design phase 5: User testing, feedback collection, and design refinement` },
    ],
    
    development: [
      { name: 'Architecture & Planning', duration: '4 hours', briefing: `Development phase 1: Design system architecture and technical specifications` },
      { name: 'Backend Development', duration: '12 hours', briefing: `Development phase 2: Implement APIs, databases, and backend services (parallel with frontend)` },
      { name: 'Frontend Development', duration: '12 hours', briefing: `Development phase 3: Build user interface and frontend components (parallel with backend)` },
      { name: 'Integration & Testing', duration: '6 hours', briefing: `Development phase 4: Integration testing, QA, and bug fixes` },
      { name: 'Deployment & Launch', duration: '2 hours', briefing: `Development phase 5: Production deployment, monitoring, and launch support` },
    ],
    
    product: [
      { name: 'Discovery & Planning', duration: '4 hours', briefing: `Product phase 1: Requirements gathering, user research, and feature prioritization` },
      { name: 'Design', duration: '8 hours', briefing: `Product phase 2: UX/UI design, wireframes, and design specifications` },
      { name: 'Development', duration: '24 hours', briefing: `Product phase 3: Full stack development, backend and frontend implementation (parallel)` },
      { name: 'Testing & QA', duration: '6 hours', briefing: `Product phase 4: Quality assurance, testing, and bug fixes` },
      { name: 'Launch & Iterate', duration: '4 hours', briefing: `Product phase 5: Production launch, user feedback collection, and iteration` },
    ],
    
    research: [
      { name: 'Research Plan', duration: '1 hour', briefing: `Research phase 1: Define research questions, methodology, and data sources` },
      { name: 'Data Collection', duration: '8 hours', briefing: `Research phase 2: Gather data from primary and secondary sources (parallel collection)` },
      { name: 'Analysis', duration: '4 hours', briefing: `Research phase 3: Analyze findings, identify patterns, and draw conclusions` },
      { name: 'Report & Insights', duration: '2 hours', briefing: `Research phase 4: Document findings and create actionable recommendations` },
    ],
    
    strategy: [
      { name: 'Market Analysis', duration: '4 hours', briefing: `Strategy phase 1: Analyze market, competitors, and opportunities` },
      { name: 'Strategy Development', duration: '8 hours', briefing: `Strategy phase 2: Develop strategic roadmap and action plan` },
      { name: 'Implementation Planning', duration: '2 hours', briefing: `Strategy phase 3: Create detailed implementation plan and KPIs` },
      { name: 'Execution & Monitoring', duration: 'Ongoing', briefing: `Strategy phase 4: Execute strategy and monitor progress against KPIs` },
    ],
    
    infrastructure: [
      { name: 'Planning & Design', duration: '2 hours', briefing: `Infrastructure phase 1: Design system architecture and infrastructure requirements` },
      { name: 'Implementation', duration: '8 hours', briefing: `Infrastructure phase 2: Set up infrastructure, automation, and CI/CD` },
      { name: 'Testing & Validation', duration: '2 hours', briefing: `Infrastructure phase 3: Test infrastructure, performance, and security` },
      { name: 'Monitoring & Optimization', duration: 'Ongoing', briefing: `Infrastructure phase 4: Monitor systems and optimize performance` },
    ],
    
    testing: [
      { name: 'Test Planning', duration: '1 hour', briefing: `Testing phase 1: Create test plan, test cases, and QA strategy` },
      { name: 'Test Automation', duration: '4 hours', briefing: `Testing phase 2: Build automated tests and test infrastructure` },
      { name: 'Execution & Reporting', duration: '8 hours', briefing: `Testing phase 3: Execute tests, log bugs, and document findings` },
      { name: 'Regression & Sign-off', duration: '2 hours', briefing: `Testing phase 4: Regression testing and QA sign-off` },
    ],
  };
  
  return phases[projectType] || phases.product;
}

// Agent routing based on task type
function getAgentForPhase(phaseName, briefing) {
  const name = phaseName.toLowerCase();
  const brief = briefing.toLowerCase();
  
  if (name.includes('design') || name.includes('wireframe') || brief.includes('design') || brief.includes('ui')) {
    return 'johnny'; // Frontend Engineer
  }
  if (name.includes('architecture') || name.includes('planning') || brief.includes('architecture')) {
    return 'chief'; // Architecture & Design
  }
  if (name.includes('backend') || name.includes('api') || name.includes('database') || brief.includes('backend') || brief.includes('api')) {
    return 'jarvis'; // Backend Engineer
  }
  if (name.includes('frontend') || brief.includes('frontend') || brief.includes('component')) {
    return 'johnny'; // Frontend Engineer
  }
  if (name.includes('test') || name.includes('qa') || brief.includes('testing') || brief.includes('qa')) {
    return 'velma'; // QA & Testing
  }
  if (name.includes('research') || name.includes('analysis') || brief.includes('research') || brief.includes('market')) {
    return 'scout'; // Research & Analysis
  }
  if (name.includes('strategy') || brief.includes('strategy') || brief.includes('roadmap')) {
    return 'laura'; // Strategy & Brand
  }
  if (name.includes('infrastructure') || name.includes('deploy') || brief.includes('infrastructure') || brief.includes('deploy')) {
    return 'steven'; // DevOps & Infrastructure
  }
  
  return 'lucy'; // Default to Lucy for orchestration
}

// Generate briefings for project phases
function generateBriefings(projectName, projectType, phases) {
  const briefings = phases.map((phase, index) => {
    const agent = getAgentForPhase(phase.name, phase.briefing);
    
    return {
      id: Date.now() + index, // Unique ID
      status: 'auto-executing', // Auto-execute level 2 tasks
      agent: agent,
      type: 'design', // Will be overridden based on phase
      title: `${projectName}: ${phase.name}`,
      description: phase.briefing,
      level: 2, // Level 2 = auto-executing
      timestamp: new Date().toISOString(),
      dueDate: null, // Can be calculated based on phase duration
      projectId: null, // Will be set by caller
      projectName: projectName,
    };
  });
  
  return briefings;
}

// Main wizard function
function createProjectStartupPlan(projectName, projectType, description) {
  const type = projectType || detectProjectType(description);
  const phases = generatePhases(type, projectName);
  const briefings = generateBriefings(projectName, type, phases);
  
  return {
    projectName,
    projectType: type,
    phases,
    briefings,
    estimatedDuration: calculateDuration(phases),
    agents: extractAgents(briefings),
  };
}

// Helper: Calculate total estimated duration (AI Velocity - account for parallel work)
function calculateDuration(phases) {
  const durationMap = {
    '1 hour': 1,
    '2 hours': 2,
    '4 hours': 4,
    '6 hours': 6,
    '8 hours': 8,
    '12 hours': 12,
    '24 hours': 24,
    '1 day': 1,
    '2-3 days': 2.5,
    '3-5 days': 4,
    '1 week': 7,
    '1-2 weeks': 10,
    '2-3 weeks': 17,
    '3-4 weeks': 24,
    'ongoing': null,
  };
  
  // Sum up hours, accounting for parallel execution
  // Phases with same agent run sequentially, different agents run in parallel
  // So divide by number of unique agents for parallel phases
  let total = 0;
  let parallelFactor = 1;
  
  for (const phase of phases) {
    const dur = durationMap[phase.duration];
    if (dur !== null) {
      total += dur / parallelFactor;
    }
  }
  
  return total;
}

// Helper: Extract unique agents
function extractAgents(briefings) {
  return [...new Set(briefings.map(b => b.agent))];
}

module.exports = {
  createProjectStartupPlan,
  detectProjectType,
  generatePhases,
  generateBriefings,
  getAgentForPhase,
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node project-startup-wizard.js <projectName> <description> [projectType]');
    console.error('Example: node project-startup-wizard.js "Home Builder Helper" "App for homeowner building management" design');
    process.exit(1);
  }
  
  const [projectName, description, projectType] = args;
  const plan = createProjectStartupPlan(projectName, projectType, description);
  
  console.log('\n📋 PROJECT STARTUP PLAN\n');
  console.log(`Project: ${plan.projectName}`);
  console.log(`Type: ${plan.projectType}`);
  console.log(`Estimated Duration: ${plan.estimatedDuration} days`);
  console.log(`Assigned Agents: ${plan.agents.join(', ')}`);
  console.log(`\nPhases:\n`);
  
  plan.phases.forEach((phase, i) => {
    console.log(`${i + 1}. ${phase.name} (${phase.duration})`);
  });
  
  console.log(`\nBriefings Generated: ${plan.briefings.length}`);
  console.log('\n✅ Plan ready for API integration\n');
}
