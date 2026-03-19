#!/usr/bin/env node

/**
 * Work Classifier
 * 
 * Analyzes incoming work/requests and classifies them by type, priority, and required skills.
 * Returns routing recommendation and delegation strategy.
 */

const fs = require('fs');
const path = require('path');

// Load capability matrix
const WORKSPACE = process.env.WORKSPACE || path.join(process.env.HOME || '', '.openclaw', 'workspace');
const CAPABILITY_MATRIX = JSON.parse(
  fs.readFileSync(path.join(WORKSPACE, 'AGENT_CAPABILITY_MATRIX.json'), 'utf8')
);

/**
 * Classify incoming work
 * @param {string} workDescription - Description of the work to be done
 * @param {string} context - Optional context (project, urgency, etc.)
 * @returns {object} Classification result with routing recommendation
 */
function classifyWork(workDescription, context = {}) {
  const words = workDescription.toLowerCase().split(/\s+/);
  
  // 1. DETECT CATEGORY
  const category = detectCategory(words);
  
  // 2. DETERMINE PRIORITY
  const priority = determinePriority(workDescription, context);
  
  // 3. EXTRACT REQUIRED SKILLS
  const requiredSkills = extractSkills(words, category);
  
  // 4. FIND BEST AGENTS
  const agentMatches = rankAgents(category, requiredSkills, context);
  
  // 5. BUILD ROUTING RECOMMENDATION
  const recommendation = buildRecommendation(
    category,
    priority,
    requiredSkills,
    agentMatches,
    context
  );
  
  return recommendation;
}

/**
 * Detect work category based on keywords
 */
function detectCategory(words) {
  const categories = CAPABILITY_MATRIX.work_categories;
  let bestMatch = null;
  let bestScore = 0;
  
  for (const [catKey, category] of Object.entries(categories)) {
    const keywords = category.keywords || [];
    const score = keywords.filter(kw => words.includes(kw.toLowerCase())).length;
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = catKey;
    }
  }
  
  // Default to medium priority if no match
  return bestMatch || 'other';
}

/**
 * Determine priority level
 */
function determinePriority(description, context) {
  const text = description.toLowerCase();
  const priorities = CAPABILITY_MATRIX.priority_levels;
  
  // Critical: security, production, data integrity
  const criticalKeywords = ['security', 'vulnerability', 'exploit', 'production', 'outage', 'down', 'data corruption', 'critical', 'urgent'];
  if (criticalKeywords.some(kw => text.includes(kw))) {
    return 'critical';
  }
  
  // High: code review, blocking, architecture
  const highKeywords = ['code review', 'pr', 'architecture', 'design decision', 'blocking'];
  if (highKeywords.some(kw => text.includes(kw))) {
    return 'high';
  }
  
  // Medium: design, docs, non-urgent review
  const mediumKeywords = ['design', 'documentation', 'doc', 'mockup', 'prototype'];
  if (mediumKeywords.some(kw => text.includes(kw))) {
    return 'medium';
  }
  
  // Low: refactoring, optimization, polish
  const lowKeywords = ['refactor', 'optimization', 'optimize', 'cleanup', 'polish', 'nice-to-have'];
  if (lowKeywords.some(kw => text.includes(kw))) {
    return 'low';
  }
  
  // Context-based override
  if (context.priority) {
    return context.priority;
  }
  
  return 'medium'; // default
}

/**
 * Extract required skills from work description
 */
function extractSkills(words, category) {
  const skills = {};
  
  // Get primary skills from category
  const categoryDef = CAPABILITY_MATRIX.work_categories[category];
  if (categoryDef) {
    const primaryAgent = CAPABILITY_MATRIX.agents[categoryDef.primary_agent];
    if (primaryAgent && primaryAgent.skills) {
      for (const [skill, level] of Object.entries(primaryAgent.skills)) {
        if (level > 0) {
          skills[skill] = level;
        }
      }
    }
  }
  
  // Add specific skill keywords found in description
  const skillKeywords = {
    'security': ['security', 'vulnerability', 'exploit', 'auth', 'encryption'],
    'architecture': ['architecture', 'design', 'schema', 'scalability'],
    'performance': ['performance', 'optimization', 'speed', 'latency', 'efficiency'],
    'testing': ['test', 'qa', 'regression', 'validation'],
    'frontend': ['ui', 'ux', 'frontend', 'component', 'layout', 'responsive'],
    'backend': ['backend', 'api', 'database', 'server', 'microservice']
  };
  
  for (const [skill, keywords] of Object.entries(skillKeywords)) {
    if (keywords.some(kw => words.includes(kw))) {
      skills[skill] = (skills[skill] || 0) + 2;
    }
  }
  
  return skills;
}

/**
 * Rank agents by skill match and availability
 */
function rankAgents(category, requiredSkills, context) {
  const categoryDef = CAPABILITY_MATRIX.work_categories[category];
  const agents = CAPABILITY_MATRIX.agents;
  
  const candidates = [];
  
  // Fallback if category not found
  if (!categoryDef) {
    console.warn(`⚠️  Category not found: ${category}. Using default routing.`);
    // Default to Jarvis for unknown work
    return [{
      agentId: 'jarvis',
      agent: 'Jarvis',
      score: 5,
      skillScore: 0,
      skillMatches: '0/0',
      availability: 10,
      status: 'active',
      capacity: 1,
      currentLoad: 0
    }];
  }
  
  // Get recommended agents for this category
  const recommendedAgents = [
    categoryDef.primary_agent,
    ...(categoryDef.secondary_agents || [])
  ];
  
  for (const agentId of recommendedAgents) {
    if (!agents[agentId]) continue;
    
    const agent = agents[agentId];
    
    // Calculate skill match
    let skillScore = 0;
    let skillMatches = 0;
    for (const [skill, requiredLevel] of Object.entries(requiredSkills)) {
      const agentLevel = agent.skills[skill] || 0;
      skillScore += Math.min(agentLevel, requiredLevel);
      if (agentLevel >= requiredLevel) {
        skillMatches++;
      }
    }
    
    // Calculate availability
    const availabilityScore = 10 - (agent.current_load || 0);
    
    // Calculate overall score
    const skillWeight = 0.6;
    const availabilityWeight = 0.3;
    const priorityWeight = 0.1;
    
    const overallScore =
      (skillScore / Math.max(Object.keys(requiredSkills).length, 1)) * skillWeight +
      availabilityScore * availabilityWeight +
      (context.priority === 'critical' ? 10 : 5) * priorityWeight;
    
    candidates.push({
      agentId,
      agent: agent.name,
      score: overallScore,
      skillScore,
      skillMatches: `${skillMatches}/${Object.keys(requiredSkills).length}`,
      availability: availabilityScore,
      status: agent.status,
      capacity: agent.capacity,
      currentLoad: agent.current_load || 0
    });
  }
  
  // Sort by score
  candidates.sort((a, b) => b.score - a.score);
  
  return candidates;
}

/**
 * Build recommendation for routing
 */
function buildRecommendation(category, priority, requiredSkills, agentMatches, context) {
  const categoryDef = CAPABILITY_MATRIX.work_categories[category];
  const primaryMatch = agentMatches[0];
  
  return {
    timestamp: new Date().toISOString(),
    classification: {
      category: category,
      categoryLabel: categoryDef?.label || 'Other',
      priority: priority,
      requiredSkills: Object.keys(requiredSkills)
    },
    recommendation: {
      primaryAgent: primaryMatch?.agentId,
      primaryAgentName: primaryMatch?.agent,
      skillMatch: primaryMatch?.skillMatches || 'N/A',
      matchScore: (primaryMatch?.score || 0).toFixed(2),
      availability: primaryMatch?.availability || 'unknown',
      canDelegateNow: (primaryMatch?.availability || 0) > 0
    },
    alternatives: agentMatches.slice(1, 3).map(a => ({
      agent: a.agent,
      agentId: a.agentId,
      score: a.score.toFixed(2)
    })),
    workflow: categoryDef?.workflow || null,
    followupAgents: categoryDef?.followup_agents || [],
    escalation: {
      shouldEscalateToTim: CAPABILITY_MATRIX.priority_levels[priority]?.escalate_to_tim || false,
      reason: CAPABILITY_MATRIX.priority_levels[priority]?.description || 'Needs review'
    },
    actionItems: generateActionItems(
      primaryMatch?.agentId,
      category,
      priority,
      context
    )
  };
}

/**
 * Generate action items based on classification
 */
function generateActionItems(agentId, category, priority, context) {
  const actions = [];
  
  // Check agent capacity
  const agent = CAPABILITY_MATRIX.agents[agentId];
  if (agent && agent.current_load >= agent.capacity) {
    actions.push({
      action: 'queue_task',
      reason: 'Agent at capacity',
      agent: agentId
    });
  } else {
    actions.push({
      action: 'delegate_immediately',
      reason: 'Agent available',
      agent: agentId
    });
  }
  
  // Check for escalation
  if (priority === 'critical') {
    actions.push({
      action: 'escalate_to_tim',
      reason: 'Critical priority requires immediate attention'
    });
  }
  
  // Check for workflows
  const categoryDef = CAPABILITY_MATRIX.work_categories[category];
  if (categoryDef?.workflow) {
    actions.push({
      action: 'start_workflow',
      workflow: categoryDef.workflow
    });
  }
  
  return actions;
}

/**
 * Format recommendation for display
 */
function formatRecommendation(recommendation) {
  const lines = [
    '═══════════════════════════════════════',
    '🔍 WORK CLASSIFICATION ANALYSIS',
    '═══════════════════════════════════════',
    '',
    `📋 Category: ${recommendation.classification.categoryLabel}`,
    `🎯 Priority: ${recommendation.classification.priority.toUpperCase()}`,
    `🧠 Required Skills: ${recommendation.classification.requiredSkills.join(', ')}`,
    '',
    `✅ Recommended Agent: ${recommendation.recommendation.primaryAgentName}`,
    `📊 Skill Match: ${recommendation.recommendation.skillMatch}`,
    `📈 Match Score: ${recommendation.recommendation.matchScore}/10`,
    `⚡ Availability: ${recommendation.recommendation.availability > 0 ? '✓ Available' : '✗ At capacity'}`,
    '',
  ];
  
  if (recommendation.alternatives.length > 0) {
    lines.push('🔄 Alternative Agents:');
    recommendation.alternatives.forEach(alt => {
      lines.push(`   ${alt.agent}: ${alt.score}/10`);
    });
    lines.push('');
  }
  
  if (recommendation.workflow) {
    lines.push(`🔗 Workflow: ${recommendation.workflow.join(' → ')}`);
    lines.push('');
  }
  
  if (recommendation.escalation.shouldEscalateToTim) {
    lines.push(`⚠️  ESCALATE TO TIM: ${recommendation.escalation.reason}`);
    lines.push('');
  }
  
  lines.push('📋 Action Items:');
  recommendation.actionItems.forEach(action => {
    lines.push(`   ${action.action}: ${action.reason}`);
  });
  
  lines.push('═══════════════════════════════════════');
  
  return lines.join('\n');
}

// CLI Usage
if (require.main === module) {
  const workDescription = process.argv[2] || 'Review the code for security issues';
  const context = {};
  
  const result = classifyWork(workDescription, context);
  console.log(formatRecommendation(result));
  console.log(JSON.stringify(result, null, 2));
}

module.exports = {
  classifyWork,
  detectCategory,
  determinePriority,
  extractSkills,
  rankAgents
};
