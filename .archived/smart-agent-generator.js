#!/usr/bin/env node

/**
 * Smart Agent Generator
 * 
 * Creates robust subagents from minimal input (just a few words).
 * Auto-generates:
 * - Full agent profile (name, title, specialty)
 * - Skill ratings (0-10 scale)
 * - Capability matrix entry
 * - Default model
 * - Role classification
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = process.env.WORKSPACE || path.join(process.env.HOME || '', '.openclaw', 'workspace');
const MATRIX_PATH = path.join(WORKSPACE, 'AGENT_CAPABILITY_MATRIX.json');

/**
 * Load capability matrix
 */
function loadMatrix() {
  try {
    return JSON.parse(fs.readFileSync(MATRIX_PATH, 'utf8'));
  } catch (err) {
    console.error('Failed to load capability matrix:', err.message);
    process.exit(1);
  }
}

/**
 * Save capability matrix
 */
function saveMatrix(matrix) {
  fs.writeFileSync(MATRIX_PATH, JSON.stringify(matrix, null, 2), 'utf8');
}

/**
 * Generate agent profile from minimal input
 * @param {string} briefDescription - e.g., "content writer for tech blogs" or "data analyzer"
 * @returns {object} Full agent profile
 */
function generateAgentProfile(briefDescription) {
  const desc = briefDescription.toLowerCase();
  
  // Parse keywords from description
  const keywords = desc.split(/\s+/);
  
  // 1. DETERMINE AGENT TYPE
  const agentType = determineAgentType(desc);
  
  // 2. GENERATE NAME & TITLE
  const { name, title } = generateNameAndTitle(desc, agentType);
  
  // 3. GENERATE SKILLS
  const skills = generateSkills(desc, agentType);
  
  // 4. GENERATE SPECIALTIES
  const specialties = generateSpecialties(desc, agentType);
  
  // 5. ASSIGN DEFAULT MODEL
  const model = assignModel(agentType);
  
  // 6. SET CAPACITY & PROPERTIES
  const capacity = agentType === 'specialist' ? 1 : 2;
  const acceptsParallel = agentType === 'coordinator' ? true : false;
  
  return {
    id: generateId(name),
    name,
    title,
    type: 'subagent',
    role: 'agent',
    status: 'active',
    skills,
    specialties,
    model,
    capacity,
    accepts_parallel: acceptsParallel,
    current_load: 0,
    priority_work: determinePriorityWork(agentType),
    description: briefDescription
  };
}

/**
 * Determine agent type from keywords
 */
function determineAgentType(desc) {
  const typeKeywords = {
    developer: ['dev', 'engineer', 'code', 'programming', 'backend', 'frontend', 'full-stack'],
    designer: ['design', 'ui', 'ux', 'interface', 'visual', 'graphic'],
    analyst: ['analyst', 'data', 'research', 'analysis', 'analyst', 'metrics'],
    writer: ['writer', 'content', 'blog', 'document', 'copy', 'article'],
    coordinator: ['coordinator', 'manager', 'orchestrat', 'lead', 'oversee', 'team'],
    specialist: ['specialist', 'expert', 'reviewer', 'auditor', 'inspector'],
    automation: ['automat', 'bot', 'script', 'workflow', 'process']
  };
  
  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some(kw => desc.includes(kw))) {
      return type;
    }
  }
  
  return 'specialist'; // default
}

/**
 * Generate name and title from description
 */
function generateNameAndTitle(desc, agentType) {
  const titleTemplates = {
    developer: (keywords) => `${capitalize(keywords[0] || 'App')} Developer`,
    designer: (keywords) => `${capitalize(keywords[0] || 'UI')} Designer`,
    analyst: (keywords) => `${capitalize(keywords[0] || 'Data')} Analyst`,
    writer: (keywords) => `${capitalize(keywords[0] || 'Content')} Writer`,
    coordinator: (keywords) => `${capitalize(keywords[0] || 'Team')} Coordinator`,
    specialist: (keywords) => `${capitalize(keywords[0] || 'Specialist')}`,
    automation: (keywords) => `${capitalize(keywords[0] || 'Workflow')} Automation`
  };
  
  const keywords = desc.split(/\s+/).filter(w => w.length > 3);
  const title = (titleTemplates[agentType] || titleTemplates.specialist)(keywords);
  
  // Extract first keyword as name basis
  let name = keywords[0] || agentType;
  name = capitalize(name);
  
  return { name, title };
}

/**
 * Generate skill profile from description
 */
function generateSkills(desc, agentType) {
  const baseSkills = {
    developer: {
      code_quality: 8,
      architecture: 7,
      debugging: 8,
      performance: 7,
      testing: 6,
      documentation: 5
    },
    designer: {
      ui_ux_design: 9,
      design_systems: 8,
      prototyping: 8,
      responsive_design: 8,
      interaction_design: 7
    },
    analyst: {
      data_analysis: 9,
      research: 8,
      insights_generation: 8,
      report_writing: 7,
      pattern_recognition: 8
    },
    writer: {
      content_creation: 9,
      writing_quality: 9,
      editing: 8,
      seo_knowledge: 6,
      storytelling: 8
    },
    coordinator: {
      team_coordination: 9,
      project_management: 8,
      planning: 8,
      communication: 9,
      problem_solving: 8
    },
    specialist: {
      task_completion: 8,
      problem_solving: 7,
      expertise: 8,
      attention_to_detail: 8,
      documentation: 6
    },
    automation: {
      workflow_design: 8,
      automation: 9,
      scripting: 8,
      integration: 7,
      reliability: 8
    }
  };
  
  // Add domain-specific skills based on keywords
  let skills = { ...baseSkills[agentType] || baseSkills.specialist };
  
  // Boost skills if mentioned in description
  if (desc.includes('security')) skills.security_analysis = 8;
  if (desc.includes('performance')) skills.performance = 8;
  if (desc.includes('test')) skills.testing = 8;
  if (desc.includes('api')) skills.api_design = 8;
  if (desc.includes('database')) skills.database_design = 8;
  if (desc.includes('mobile')) skills.mobile_design = 8;
  if (desc.includes('responsive')) skills.responsive_design = 9;
  
  // Base skills everyone has
  skills.task_completion = 7;
  skills.problem_solving = 7;
  skills.documentation = 6;
  
  return skills;
}

/**
 * Generate specialties from description
 */
function generateSpecialties(desc, agentType) {
  const specialtyTemplates = {
    developer: [
      'Full-stack software development',
      'API design and implementation',
      'Code quality and architecture',
      'Performance optimization'
    ],
    designer: [
      'Modern UI/UX design',
      'Design systems and specifications',
      'Interactive prototypes',
      'Responsive design'
    ],
    analyst: [
      'Data analysis and insights',
      'Research and pattern recognition',
      'Report generation',
      'Metrics and KPI tracking'
    ],
    writer: [
      'Content creation and editing',
      'Clear technical writing',
      'Blog and article writing',
      'Documentation'
    ],
    coordinator: [
      'Team coordination and leadership',
      'Project planning and execution',
      'Communication and alignment',
      'Resource management'
    ],
    specialist: [
      'Expert-level problem solving',
      'Deep domain expertise',
      'Quality assurance',
      'Specialized analysis'
    ],
    automation: [
      'Workflow automation',
      'Script development and integration',
      'Process optimization',
      'Reliability and error handling'
    ]
  };
  
  return specialtyTemplates[agentType] || specialtyTemplates.specialist;
}

/**
 * Assign best model for agent type
 */
function assignModel(agentType) {
  const modelAssignments = {
    developer: 'Claude Sonnet 4.6',
    designer: 'Claude Opus 4.6',
    analyst: 'Claude Opus 4.6',
    writer: 'Claude Sonnet 4.6',
    coordinator: 'Claude Sonnet 4.6',
    specialist: 'Claude Opus 4.6',
    automation: 'Claude Sonnet 4.6'
  };
  
  return modelAssignments[agentType] || 'Claude Sonnet 4.6';
}

/**
 * Determine priority work for agent
 */
function determinePriorityWork(agentType) {
  const priorityMap = {
    developer: ['feature_development', 'code_review', 'backend'],
    designer: ['design', 'ui_ux', 'prototyping'],
    analyst: ['analysis', 'research', 'reporting'],
    writer: ['content', 'documentation', 'writing'],
    coordinator: ['coordination', 'planning', 'team'],
    specialist: ['quality', 'verification', 'expertise'],
    automation: ['automation', 'workflow', 'integration']
  };
  
  return priorityMap[agentType] || ['task_completion'];
}

/**
 * Generate unique ID from name
 */
function generateId(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Register agent in capability matrix
 */
function registerAgent(agentProfile) {
  const matrix = loadMatrix();
  
  // Add to agents
  matrix.agents[agentProfile.id] = {
    id: agentProfile.id,
    name: agentProfile.name,
    title: agentProfile.title,
    role: agentProfile.role,
    type: agentProfile.type,
    status: agentProfile.status,
    skills: agentProfile.skills,
    specialties: agentProfile.specialties,
    priority_work: agentProfile.priority_work,
    capacity: agentProfile.capacity,
    current_load: 0,
    accepts_parallel: agentProfile.accepts_parallel
  };
  
  // Save
  saveMatrix(matrix);
  
  return matrix.agents[agentProfile.id];
}

// CLI
if (require.main === module) {
  const briefDescription = process.argv[2];
  
  if (!briefDescription) {
    console.log(`
Smart Agent Generator

Usage:
  node smart-agent-generator.js "<brief description>"

Examples:
  node smart-agent-generator.js "content writer for tech blogs"
  node smart-agent-generator.js "data analyst for metrics"
  node smart-agent-generator.js "security code reviewer"
  node smart-agent-generator.js "mobile app designer"
    `);
    process.exit(1);
  }
  
  console.log('\n🤖 GENERATING AGENT PROFILE...\n');
  
  const profile = generateAgentProfile(briefDescription);
  console.log(JSON.stringify(profile, null, 2));
  
  console.log('\n📋 REGISTERING IN CAPABILITY MATRIX...\n');
  const registered = registerAgent(profile);
  
  console.log(`✅ AGENT CREATED & REGISTERED!\n`);
  console.log(`Name: ${registered.name}`);
  console.log(`Title: ${registered.title}`);
  console.log(`ID: ${registered.id}`);
  console.log(`Model: ${registered.skills ? Object.keys(registered.skills).length : 0} skills`);
  console.log(`Specialties: ${registered.specialties.join(', ')}`);
  console.log('\n');
}

module.exports = {
  generateAgentProfile,
  determineAgentType,
  generateNameAndTitle,
  generateSkills,
  generateSpecialties,
  registerAgent
};
