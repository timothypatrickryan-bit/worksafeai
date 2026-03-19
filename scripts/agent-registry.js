#!/usr/bin/env node

/**
 * Agent Registry
 * 
 * Manages agent capability matrix updates. When new subagents are created,
 * they're automatically registered with default capabilities and a setup wizard.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const WORKSPACE = process.env.WORKSPACE || path.join(process.env.HOME || '', '.openclaw', 'workspace');
const MATRIX_PATH = path.join(WORKSPACE, 'AGENT_CAPABILITY_MATRIX.json');

/**
 * Load current capability matrix
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
 * Register new agent with default capabilities
 */
function registerAgent(agentData) {
  const matrix = loadMatrix();
  
  const newAgent = {
    id: agentData.id,
    name: agentData.name,
    title: agentData.title,
    role: 'agent',
    type: agentData.type || 'subagent',
    status: 'active',
    skills: agentData.skills || generateDefaultSkills(agentData.title),
    specialties: agentData.specialties || [],
    priority_work: agentData.priority_work || [],
    capacity: agentData.capacity || 1,
    current_load: 0,
    accepts_parallel: agentData.accepts_parallel || false
  };
  
  // Add to matrix
  matrix.agents[agentData.id] = newAgent;
  saveMatrix(matrix);
  
  return newAgent;
}

/**
 * Generate default skills based on agent title
 */
function generateDefaultSkills(title) {
  const skills = {
    task_completion: 5,
    problem_solving: 5,
    documentation: 4
  };
  
  const titleLower = title.toLowerCase();
  
  // Add skills based on title keywords
  if (titleLower.includes('design')) {
    skills.ui_ux_design = 8;
    skills.prototyping = 7;
    skills.design_systems = 6;
  }
  if (titleLower.includes('dev') || titleLower.includes('engineer')) {
    skills.full_stack_dev = 7;
    skills.code_quality = 6;
    skills.architecture = 6;
  }
  if (titleLower.includes('test') || titleLower.includes('qa')) {
    skills.qa_testing = 8;
    skills.regression_testing = 7;
  }
  if (titleLower.includes('data') || titleLower.includes('analyst')) {
    skills.data_analysis = 8;
    skills.research = 7;
  }
  if (titleLower.includes('marketing') || titleLower.includes('strategy')) {
    skills.brand_strategy = 8;
    skills.market_research = 7;
  }
  if (titleLower.includes('devops') || titleLower.includes('infra')) {
    skills.system_monitoring = 8;
    skills.orchestration = 7;
  }
  
  return skills;
}

/**
 * Interactive wizard for registering new agent
 */
async function interactiveWizard() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));
  
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Agent Registration Wizard            ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  const id = await question('Agent ID (e.g., researcher, analyst): ');
  const name = await question('Agent Name (e.g., Dr. Researcher): ');
  const title = await question('Agent Title/Role: ');
  const specialtiesInput = await question('Specialties (comma-separated): ');
  const specialties = specialtiesInput.split(',').map(s => s.trim()).filter(s => s);
  
  // Generate default skills
  const skills = generateDefaultSkills(title);
  
  // Option to customize skills
  const customize = await question('\nCustomize skill levels? (y/n): ');
  if (customize.toLowerCase() === 'y') {
    console.log('\nSkill Customization (scale 0-10):');
    for (const [skill, level] of Object.entries(skills)) {
      const input = await question(`${skill} (current: ${level}): `);
      if (input) {
        skills[skill] = parseInt(input) || level;
      }
    }
  }
  
  rl.close();
  
  return {
    id,
    name,
    title,
    specialties,
    skills,
    type: 'subagent',
    capacity: 1,
    accepts_parallel: false
  };
}

/**
 * Update agent capabilities
 */
function updateAgent(agentId, updates) {
  const matrix = loadMatrix();
  
  if (!matrix.agents[agentId]) {
    console.error(`Agent not found: ${agentId}`);
    process.exit(1);
  }
  
  matrix.agents[agentId] = {
    ...matrix.agents[agentId],
    ...updates
  };
  
  saveMatrix(matrix);
  console.log(`✅ Agent ${agentId} updated`);
}

/**
 * List all registered agents
 */
function listAgents() {
  const matrix = loadMatrix();
  
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Registered Agents                    ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  for (const [id, agent] of Object.entries(matrix.agents)) {
    const skillCount = Object.values(agent.skills || {}).filter(s => s > 0).length;
    console.log(`📌 ${agent.name} (${id})`);
    console.log(`   Title: ${agent.title}`);
    console.log(`   Status: ${agent.status}`);
    console.log(`   Skills: ${skillCount} specialties`);
    console.log(`   Load: ${agent.current_load || 0}/${agent.capacity || 1}`);
    console.log('');
  }
}

/**
 * Validate agent can handle work category
 */
function validateAgentForWork(agentId, workCategory) {
  const matrix = loadMatrix();
  const agent = matrix.agents[agentId];
  
  if (!agent) {
    return { valid: false, reason: 'Agent not found' };
  }
  
  const categoryDef = matrix.work_categories[workCategory];
  if (!categoryDef) {
    return { valid: false, reason: 'Work category not found' };
  }
  
  // Check if agent has primary or secondary role
  const isPrimaryAgent = categoryDef.primary_agent === agentId;
  const isSecondaryAgent = (categoryDef.secondary_agents || []).includes(agentId);
  
  if (!isPrimaryAgent && !isSecondaryAgent) {
    return { valid: false, reason: `${agent.name} is not qualified for ${categoryDef.label}` };
  }
  
  // Check capacity
  if ((agent.current_load || 0) >= (agent.capacity || 1)) {
    return { valid: false, reason: `${agent.name} is at capacity` };
  }
  
  return { valid: true, reason: `${agent.name} can handle this work` };
}

// CLI
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'list':
      listAgents();
      break;
      
    case 'register':
      interactiveWizard().then(agentData => {
        const registered = registerAgent(agentData);
        console.log(`\n✅ Agent registered: ${registered.name}`);
        console.log(JSON.stringify(registered, null, 2));
      });
      break;
      
    case 'register-auto':
      // Auto-register with provided data
      const agentData = JSON.parse(process.argv[3] || '{}');
      const registered = registerAgent(agentData);
      console.log(JSON.stringify(registered, null, 2));
      break;
      
    case 'update':
      const updateId = process.argv[3];
      const updateData = JSON.parse(process.argv[4] || '{}');
      updateAgent(updateId, updateData);
      break;
      
    case 'validate':
      const agentIdToCheck = process.argv[3];
      const workCat = process.argv[4];
      const result = validateAgentForWork(agentIdToCheck, workCat);
      console.log(JSON.stringify(result, null, 2));
      break;
      
    default:
      console.log(`
Agent Registry CLI

Commands:
  list              - List all registered agents
  register          - Interactive wizard to register new agent
  register-auto     - Auto-register with JSON data
  update            - Update agent capabilities
  validate          - Validate agent for work category
      `);
  }
}

module.exports = {
  loadMatrix,
  saveMatrix,
  registerAgent,
  updateAgent,
  listAgents,
  validateAgentForWork,
  generateDefaultSkills
};
