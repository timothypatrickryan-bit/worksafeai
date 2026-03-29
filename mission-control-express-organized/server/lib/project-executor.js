/**
 * Project Executor
 * Automatically executes projects when created
 * - Detects project type
 * - Decomposes into tasks
 * - Generates briefings
 * - Executes L1-3 work immediately
 * - Routes L4 work to Briefing Queue
 */

const fs = require('fs');
const path = require('path');

// Detect project type from description and name
function detectProjectType(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  
  if (text.includes('infrastructure') || text.includes('devops') || text.includes('deployment') || text.includes('ci/cd') || text.includes('server')) {
    return 'infrastructure';
  }
  if (text.includes('feature') || text.includes('development') || text.includes('code') || text.includes('bug') || text.includes('refactor')) {
    return 'development';
  }
  if (text.includes('research') || text.includes('analysis') || text.includes('market') || text.includes('competitive') || text.includes('study')) {
    return 'research';
  }
  if (text.includes('marketing') || text.includes('campaign') || text.includes('linkedin') || text.includes('post') || text.includes('content')) {
    return 'marketing';
  }
  if (text.includes('strategy') || text.includes('planning') || text.includes('roadmap') || text.includes('vision') || text.includes('direction')) {
    return 'strategy';
  }
  if (text.includes('operations') || text.includes('process') || text.includes('workflow') || text.includes('automation') || text.includes('system')) {
    return 'operations';
  }
  if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('interface') || text.includes('visual')) {
    return 'design';
  }
  
  return 'general';
}

// Generate tasks based on project type and details
function generateTasks(projectType, name, description, owner, timeline, goals) {
  const baseTasks = {
    general: [
      { title: 'Plan and scope', description: `Define scope for: ${name}` },
      { title: 'Execute work', description: 'Complete core deliverables' },
      { title: 'Review and validate', description: 'Quality assurance and verification' },
      { title: 'Document and close', description: 'Final documentation and project closure' },
    ],
    infrastructure: [
      { title: 'Architecture design', description: 'Plan infrastructure architecture and deployment strategy' },
      { title: 'Environment setup', description: 'Configure dev, staging, and production environments' },
      { title: 'Deployment pipeline', description: 'Build CI/CD pipeline and automation' },
      { title: 'Monitoring & alerts', description: 'Set up monitoring, logging, and alerting' },
      { title: 'Security hardening', description: 'Apply security best practices and compliance' },
      { title: 'Testing & validation', description: 'Test all systems and performance benchmarks' },
    ],
    development: [
      { title: 'Requirements & design', description: 'Finalize requirements and technical design' },
      { title: 'Implementation', description: 'Code implementation and unit testing' },
      { title: 'Code review', description: 'Peer review and address feedback' },
      { title: 'Integration testing', description: 'Test integration with other systems' },
      { title: 'Documentation', description: 'Create API docs and technical documentation' },
      { title: 'Deployment', description: 'Deploy to production and verify' },
    ],
    research: [
      { title: 'Literature review', description: 'Gather and analyze relevant research and data' },
      { title: 'Data collection', description: 'Collect primary and secondary data' },
      { title: 'Analysis', description: 'Analyze findings and identify patterns' },
      { title: 'Synthesis', description: 'Synthesize into key insights and recommendations' },
      { title: 'Reporting', description: 'Create research report and presentation' },
    ],
    marketing: [
      { title: 'Strategy & positioning', description: 'Define target audience and messaging' },
      { title: 'Content creation', description: 'Create marketing materials and content' },
      { title: 'Campaign launch', description: 'Execute campaign across channels' },
      { title: 'Monitoring & optimization', description: 'Track metrics and optimize performance' },
      { title: 'Reporting & analysis', description: 'Report on results and ROI' },
    ],
    strategy: [
      { title: 'Situation analysis', description: 'Analyze current state and market context' },
      { title: 'Strategic planning', description: 'Develop strategic roadmap and priorities' },
      { title: 'Resource planning', description: 'Allocate resources and define timeline' },
      { title: 'Communication', description: 'Communicate strategy to stakeholders' },
      { title: 'Execution tracking', description: 'Monitor execution and adjust as needed' },
    ],
    operations: [
      { title: 'Process design', description: 'Define workflow and process steps' },
      { title: 'System setup', description: 'Configure tools and systems' },
      { title: 'Documentation', description: 'Create process documentation and playbooks' },
      { title: 'Testing', description: 'Test process and identify improvements' },
      { title: 'Rollout & training', description: 'Train team and deploy process' },
    ],
    design: [
      { title: 'Concept & wireframes', description: 'Create design concepts and wireframes' },
      { title: 'High-fidelity design', description: 'Develop high-fidelity mockups' },
      { title: 'Design system', description: 'Create design system and components' },
      { title: 'Handoff & specs', description: 'Prepare specs for development' },
      { title: 'Validation & iteration', description: 'Test with users and iterate' },
    ],
  };

  return baseTasks[projectType] || baseTasks.general;
}

// Determine autonomy level for each task
function determineLevel(taskTitle, projectType) {
  // L1-2: Routine/implementation tasks
  const routineTasks = ['implementation', 'code', 'testing', 'documentation', 'setup', 'configuration', 'deployment', 'rollout', 'content creation', 'design'];
  if (routineTasks.some(t => taskTitle.toLowerCase().includes(t))) {
    return 2;
  }

  // L3: Strategic/planning tasks
  const strategicTasks = ['planning', 'strategy', 'architecture', 'design', 'analysis', 'review', 'roadmap'];
  if (strategicTasks.some(t => taskTitle.toLowerCase().includes(t))) {
    return 3;
  }

  // L4: External/approval tasks (none for projects typically)
  return 2; // Default to routine
}

// Generate briefing for task
function generateBriefing(project, task, level) {
  return {
    id: Date.now() + Math.random(),
    status: level === 4 ? 'awaiting-approval' : (level === 3 ? 'executing' : 'auto-executing'),
    agent: project.owner || 'Lucy',
    type: 'Task Briefing',
    title: `${project.name}: ${task.title}`,
    description: `
Project: ${project.name}
Task: ${task.title}
Details: ${task.description}
Timeline: ${project.timeline || 'TBD'}
Owner: ${project.owner || 'Lucy'}

Goals: ${project.goals || 'See project details'}

This is a Level ${level} task for "${project.name}".
${level === 1 || level === 2 ? '✅ Execute immediately.' : level === 3 ? '⚠️ Execute and notify.' : '❌ Needs approval.'}
    `.trim(),
    level: level,
    timestamp: new Date().toISOString(),
  };
}

// Execute project: create tasks and briefings
function executeProject(project) {
  try {
    const projectType = detectProjectType(project.name, project.description);
    const tasks = generateTasks(projectType, project.name, project.description, project.owner, project.timeline, project.goals);
    
    // Load briefings
    const briefingsPath = path.join(__dirname, '../data/briefings.json');
    let briefings = [];
    try {
      if (fs.existsSync(briefingsPath)) {
        briefings = JSON.parse(fs.readFileSync(briefingsPath, 'utf8'));
      }
    } catch (e) {
      console.error('Failed to load briefings:', e.message);
    }

    // Generate briefings for each task
    const generatedBriefings = tasks.map(task => {
      const level = determineLevel(task.title, projectType);
      return generateBriefing(project, task, level);
    });

    // Add briefings
    briefings.push(...generatedBriefings);
    fs.writeFileSync(briefingsPath, JSON.stringify(briefings, null, 2));

    console.log(`✅ Project executed: ${project.name} (${projectType})`);
    console.log(`   Generated ${generatedBriefings.length} briefings`);
    console.log(`   Tasks: ${tasks.map(t => t.title).join(', ')}`);

    return {
      success: true,
      projectType,
      taskCount: tasks.length,
      briefingCount: generatedBriefings.length,
      briefings: generatedBriefings,
    };
  } catch (err) {
    console.error('Failed to execute project:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = {
  detectProjectType,
  generateTasks,
  determineLevel,
  generateBriefing,
  executeProject,
};
