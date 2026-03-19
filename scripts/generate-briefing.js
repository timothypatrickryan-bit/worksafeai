#!/usr/bin/env node

/**
 * Briefing Generator
 * 
 * Converts task objects into structured execution plans with:
 * - Title, Description, Clear Deliverables
 * - Milestones (3-5 key checkpoints)
 * - Timeline (estimated hours/days)
 * - Resources needed
 * - Success criteria
 * 
 * Usage:
 *   node scripts/generate-briefing.js <taskId>
 *   node scripts/generate-briefing.js --all
 *   node scripts/generate-briefing.js --examples
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');

// Read state file
function readState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { tasks: [], team: { members: [] } };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

/**
 * Generate a briefing from a task object
 * 
 * @param {Object} task - Task object with id, title, description, assignedTo, etc.
 * @param {Object} state - Full state object for context (team, projects, etc.)
 * @returns {Object} Structured briefing object
 */
function generateBriefing(task, state) {
  if (!task || !task.id) {
    throw new Error('Task must have an id');
  }

  const agent = findAgent(task.assignedTo, state);
  const category = task.category || classifyTask(task.description);
  
  const briefing = {
    id: `briefing-${task.id}`,
    taskId: task.id,
    title: task.title,
    description: task.description,
    assignedTo: task.assignedTo,
    assignedAgentName: agent ? agent.name : 'Unassigned',
    assignedAgentTitle: agent ? agent.title : 'Unknown',
    category: category,
    priority: task.priority || 'medium',
    status: task.status || 'queued',
    dueDate: task.dueDate || null,
    createdAt: task.createdAt,
    
    // Core briefing sections
    deliverables: generateDeliverables(task, category),
    milestones: generateMilestones(task, category),
    timeline: generateTimeline(task, category),
    resourcesNeeded: generateResources(task, category, agent, state),
    successCriteria: generateSuccessCriteria(task, category),
    
    // Additional context
    estimatedHours: estimateHours(task, category),
    estimatedDays: estimateDays(task, category),
    dependencies: extractDependencies(task, state),
    risks: identifyRisks(task, category),
    
    // Generated at
    generatedAt: new Date().toISOString(),
  };
  
  return briefing;
}

/**
 * Find agent by ID in state
 */
function findAgent(agentId, state) {
  if (!agentId || !state.team || !state.team.members) return null;
  return state.team.members.find(m => m.id === agentId);
}

/**
 * Classify task into category
 */
function classifyTask(description) {
  const desc = (description || '').toLowerCase();
  
  if (desc.includes('design') || desc.includes('ui') || desc.includes('ux') || 
      desc.includes('mockup') || desc.includes('figma')) {
    return 'design';
  }
  if (desc.includes('develop') || desc.includes('code') || desc.includes('build') || 
      desc.includes('api') || desc.includes('backend') || desc.includes('frontend')) {
    return 'development';
  }
  if (desc.includes('audit') || desc.includes('review') || desc.includes('security')) {
    return 'security';
  }
  if (desc.includes('research') || desc.includes('analysis') || desc.includes('investigate') ||
      desc.includes('competitor') || desc.includes('trend')) {
    return 'research';
  }
  if (desc.includes('strategy') || desc.includes('plan') || desc.includes('positioning') ||
      desc.includes('growth') || desc.includes('market')) {
    return 'strategy';
  }
  if (desc.includes('test') || desc.includes('qa') || desc.includes('quality')) {
    return 'qa';
  }
  if (desc.includes('deploy') || desc.includes('infra') || desc.includes('infrastructure') ||
      desc.includes('devops') || desc.includes('ci/cd')) {
    return 'infrastructure';
  }
  
  return 'general';
}

/**
 * Generate clear, actionable deliverables
 */
function generateDeliverables(task, category) {
  const description = task.description || '';
  const deliverables = [];
  
  // Extract explicit deliverables from description
  const deliverablesMatch = description.match(/[Dd]eliverables?:\s*([^.!?]+(?:[.!?][^.!?]+)*)/);
  if (deliverablesMatch) {
    const extracted = deliverablesMatch[1]
      .split(/[•\n-]/)
      .map(d => d.trim())
      .filter(d => d && d.length > 10);
    deliverables.push(...extracted);
  }
  
  // Category-based default deliverables
  switch (category) {
    case 'design':
      if (!deliverables.length) {
        deliverables.push(
          'High-fidelity mockups in Figma (or approved design tool)',
          'Design specification document (components, colors, typography, spacing)',
          'Interaction patterns and user flow diagrams',
          'Mobile & desktop responsive considerations',
          'Design handoff documentation for development'
        );
      }
      break;
      
    case 'development':
      if (!deliverables.length) {
        deliverables.push(
          'Working implementation with all features functional',
          'Code merged to main branch with clean commit history',
          'API documentation (if applicable)',
          'Unit tests with >80% coverage',
          'Deployment ready (staging verified)'
        );
      }
      break;
      
    case 'security':
      if (!deliverables.length) {
        deliverables.push(
          'Comprehensive security audit report',
          'Vulnerability assessment with severity ratings',
          'Remediation recommendations with priority levels',
          'Implementation plan for critical issues',
          'Verification checklist for fixes'
        );
      }
      break;
      
    case 'research':
      if (!deliverables.length) {
        deliverables.push(
          'Research findings document with citations',
          'Data visualization & analysis (charts, tables)',
          'Competitive intelligence summary',
          'Trend analysis & insights',
          'Actionable recommendations'
        );
      }
      break;
      
    case 'strategy':
      if (!deliverables.length) {
        deliverables.push(
          'Strategic plan document (goals, objectives, tactics)',
          'Market analysis & positioning recommendations',
          'Go-to-market roadmap with phases',
          'Success metrics & KPIs',
          'Executive summary for stakeholder review'
        );
      }
      break;
      
    case 'qa':
      if (!deliverables.length) {
        deliverables.push(
          'Test plan and test cases',
          'Test execution report with coverage summary',
          'Bug report with reproduction steps (if issues found)',
          'Quality metrics report',
          'Sign-off documentation'
        );
      }
      break;
      
    case 'infrastructure':
      if (!deliverables.length) {
        deliverables.push(
          'Architecture diagram & documentation',
          'Implementation checklist',
          'Deployment guide & runbooks',
          'Monitoring & alerting setup',
          'Rollback & recovery procedures'
        );
      }
      break;
      
    default:
      if (!deliverables.length) {
        deliverables.push(
          'Complete project deliverables',
          'Documentation & handoff notes',
          'Quality verification',
          'Stakeholder sign-off'
        );
      }
  }
  
  return deliverables;
}

/**
 * Generate 3-5 key milestones with checkpoints
 */
function generateMilestones(task, category) {
  const milestones = [];
  
  switch (category) {
    case 'design':
      milestones.push(
        { name: 'Discovery & Requirements', description: 'Understand user needs, constraints, technical requirements', day: 0.5 },
        { name: 'Wireframes & Flow', description: 'Create low-fidelity layouts and user journeys', day: 1 },
        { name: 'High-Fidelity Design', description: 'Develop polished mockups with design system components', day: 1.5 },
        { name: 'Design Review & Iteration', description: 'Stakeholder feedback and refinement', day: 1 },
        { name: 'Handoff & Documentation', description: 'Prepare design specs and component library for dev', day: 0.5 }
      );
      break;
      
    case 'development':
      milestones.push(
        { name: 'Architecture & Setup', description: 'Design system, create project structure, set up CI/CD', day: 1 },
        { name: 'Core Implementation', description: 'Develop main features and functionality', day: 2.5 },
        { name: 'Testing & Optimization', description: 'Write tests, fix bugs, optimize performance', day: 1.5 },
        { name: 'Code Review & Integration', description: 'Peer review, address feedback, merge to main', day: 1 },
        { name: 'Staging & Deployment', description: 'Deploy to staging, final verification, production ready', day: 0.5 }
      );
      break;
      
    case 'security':
      milestones.push(
        { name: 'Scope & Planning', description: 'Define audit scope, review checklist, create test plan', day: 0.5 },
        { name: 'Vulnerability Assessment', description: 'Scan, test, identify security issues', day: 2 },
        { name: 'Analysis & Documentation', description: 'Categorize findings, write detailed report', day: 1 },
        { name: 'Remediation Plan', description: 'Prioritize issues, recommend fixes, estimate effort', day: 1 },
        { name: 'Verification & Sign-off', description: 'Validate fixes, provide final assessment', day: 0.5 }
      );
      break;
      
    case 'research':
      milestones.push(
        { name: 'Research Plan', description: 'Define research questions, identify sources', day: 0.5 },
        { name: 'Data Collection', description: 'Gather data from primary and secondary sources', day: 1.5 },
        { name: 'Analysis & Synthesis', description: 'Analyze data, identify patterns, synthesize insights', day: 1.5 },
        { name: 'Visualization & Presentation', description: 'Create charts, graphs, and visual summaries', day: 0.75 },
        { name: 'Recommendations & Report', description: 'Document findings and actionable recommendations', day: 0.75 }
      );
      break;
      
    case 'strategy':
      milestones.push(
        { name: 'Situation Analysis', description: 'Market research, competitive analysis, SWOT', day: 1.5 },
        { name: 'Strategy Development', description: 'Define positioning, goals, tactics', day: 1.5 },
        { name: 'Roadmap Creation', description: 'Break into phases, set milestones, assign resources', day: 1 },
        { name: 'Business Case & KPIs', description: 'Financial model, success metrics, monitoring plan', day: 1 },
        { name: 'Stakeholder Review', description: 'Present strategy, gather feedback, finalize', day: 0.5 }
      );
      break;
      
    case 'qa':
      milestones.push(
        { name: 'Test Planning', description: 'Define scope, create test strategy and checklist', day: 0.75 },
        { name: 'Test Execution', description: 'Run tests across features and platforms', day: 1.5 },
        { name: 'Bug Reporting', description: 'Document issues with reproduction steps', day: 0.75 },
        { name: 'Verification & Retesting', description: 'Verify fixes, perform regression testing', day: 1 },
        { name: 'Report & Sign-off', description: 'Generate metrics, document findings, obtain approval', day: 0.5 }
      );
      break;
      
    case 'infrastructure':
      milestones.push(
        { name: 'Design & Planning', description: 'Architecture review, infrastructure design', day: 1 },
        { name: 'Implementation', description: 'Set up systems, configure services', day: 1.5 },
        { name: 'Testing & Validation', description: 'Load testing, security verification, failover tests', day: 1.5 },
        { name: 'Documentation', description: 'Create runbooks, deployment guides, monitoring setup', day: 0.75 },
        { name: 'Deployment & Monitoring', description: 'Deploy to production, establish monitoring', day: 0.75 }
      );
      break;
      
    default:
      milestones.push(
        { name: 'Planning', description: 'Define requirements and approach', day: 0.5 },
        { name: 'Execution', description: 'Implement the core work', day: 1.5 },
        { name: 'Quality Assurance', description: 'Review and verify work', day: 0.5 },
        { name: 'Delivery', description: 'Prepare and deliver final output', day: 0.5 }
      );
  }
  
  return milestones;
}

/**
 * Estimate hours based on category and description
 */
function estimateHours(task, category) {
  let baseHours = 8;
  
  switch (category) {
    case 'design':
      baseHours = 20;
      break;
    case 'development':
      baseHours = 40;
      break;
    case 'security':
      baseHours = 24;
      break;
    case 'research':
      baseHours = 16;
      break;
    case 'strategy':
      baseHours = 20;
      break;
    case 'qa':
      baseHours = 16;
      break;
    case 'infrastructure':
      baseHours = 24;
      break;
  }
  
  // Adjust for complexity indicators
  const desc = (task.description || '').toLowerCase();
  if (desc.includes('multiple') || desc.includes('complex') || desc.includes('large')) {
    baseHours *= 1.5;
  }
  if (desc.includes('mobile') || desc.includes('responsive')) {
    baseHours *= 1.2;
  }
  if (desc.includes('integration') || desc.includes('api')) {
    baseHours *= 1.1;
  }
  
  return Math.round(baseHours);
}

/**
 * Convert hours to days (8 hours/day)
 */
function estimateDays(task, category) {
  const hours = estimateHours(task, category);
  return Math.round((hours / 8) * 10) / 10; // Round to 0.1 days
}

/**
 * Generate timeline summary
 */
function generateTimeline(task, category) {
  const days = estimateDays(task, category);
  const hours = estimateHours(task, category);
  
  return {
    estimatedHours: hours,
    estimatedDays: days,
    summary: `${days} days (${hours} hours)`,
    breakdown: generateMilestones(task, category).map(m => ({
      milestone: m.name,
      estimatedDays: m.day
    }))
  };
}

/**
 * Generate required resources
 */
function generateResources(task, category, agent, state) {
  const resources = {
    team: [],
    tools: [],
    infrastructure: [],
    external: [],
    documentation: []
  };
  
  // Add assigned agent
  if (agent) {
    resources.team.push({
      role: agent.title,
      name: agent.name,
      model: agent.model,
      allocation: '100%'
    });
  }
  
  // Category-specific resources
  switch (category) {
    case 'design':
      resources.tools.push(
        'Figma (or design tool with access)',
        'Design system / component library',
        'Prototyping tool (optional: Framer, Principle)'
      );
      resources.documentation.push(
        'Design brief and requirements',
        'Brand guidelines',
        'User personas',
        'Competitor design references'
      );
      break;
      
    case 'development':
      resources.tools.push(
        'IDE / Code editor',
        'Git version control',
        'CI/CD pipeline access',
        'Development environment setup'
      );
      resources.infrastructure.push(
        'Staging environment',
        'Database access',
        'API endpoints & credentials',
        'Deployment permissions'
      );
      resources.documentation.push(
        'Technical specifications',
        'API documentation',
        'Architecture diagrams',
        'Existing codebase documentation'
      );
      
      // Add potential secondary agents
      if (state.team && state.team.members) {
        const qaAgent = state.team.members.find(m => m.id === 'velma' || m.title.includes('QA'));
        if (qaAgent) {
          resources.team.push({
            role: 'QA / Code Review',
            name: qaAgent.name,
            model: qaAgent.model,
            allocation: '20%',
            phase: 'testing & integration'
          });
        }
      }
      break;
      
    case 'security':
      resources.tools.push(
        'Security scanning tools (SAST/DAST)',
        'Vulnerability database access',
        'Penetration testing tools (if applicable)',
        'Code analysis tools'
      );
      resources.infrastructure.push(
        'Access to code repositories',
        'Access to deployed systems',
        'Database query access',
        'Log analysis tools'
      );
      resources.documentation.push(
        'Security policies & standards',
        'Threat model (if available)',
        'Previous audit reports',
        'System architecture documentation'
      );
      break;
      
    case 'research':
      resources.tools.push(
        'Research platforms & databases',
        'Data visualization tools (Tableau, D3.js, etc.)',
        'Survey tools (if needed)',
        'Analytics platforms'
      );
      resources.external.push(
        'Competitor websites & products',
        'Industry reports & publications',
        'Market data sources',
        'Expert interviews (if applicable)'
      );
      resources.documentation.push(
        'Research questions & methodology',
        'Data sources list',
        'Citation standards',
        'Previous research findings'
      );
      break;
      
    case 'strategy':
      resources.tools.push(
        'Strategy planning tools (Miro, Figma)',
        'Financial modeling tools',
        'Market research platforms'
      );
      resources.external.push(
        'Market data & reports',
        'Competitor intelligence',
        'Industry trend analysis',
        'Customer interviews (if applicable)'
      );
      resources.documentation.push(
        'Business context & goals',
        'Historical performance data',
        'Customer insights',
        'Competitive analysis reports'
      );
      
      // Add potential secondary agents
      if (state.team && state.team.members) {
        const researchAgent = state.team.members.find(m => m.id === 'scout' || m.title.includes('Research'));
        if (researchAgent) {
          resources.team.push({
            role: 'Research & Intelligence',
            name: researchAgent.name,
            model: researchAgent.model,
            allocation: '30%',
            phase: 'discovery & analysis'
          });
        }
      }
      break;
      
    case 'qa':
      resources.tools.push(
        'Test management platform',
        'Bug tracking system',
        'Test automation framework (if applicable)',
        'Performance testing tools'
      );
      resources.infrastructure.push(
        'Test environment access',
        'Multiple browser/device configurations',
        'Test data',
        'Database reset capabilities'
      );
      resources.documentation.push(
        'Product requirements & user stories',
        'Acceptance criteria',
        'Previous test plans',
        'Known issues list'
      );
      break;
      
    case 'infrastructure':
      resources.tools.push(
        'Infrastructure as Code tools (Terraform, CloudFormation)',
        'Monitoring & logging platforms',
        'Container orchestration (Docker, Kubernetes)',
        'Configuration management tools'
      );
      resources.infrastructure.push(
        'Cloud provider access & permissions',
        'Network access',
        'Certificate & key management',
        'Deployment pipeline access'
      );
      resources.documentation.push(
        'Current infrastructure diagram',
        'System requirements & specs',
        'Scaling policies',
        'Disaster recovery plan'
      );
      break;
  }
  
  return resources;
}

/**
 * Generate success criteria
 */
function generateSuccessCriteria(task, category) {
  const criteria = [];
  
  // Always include completion criteria
  criteria.push({
    type: 'Completion',
    description: 'All deliverables completed and reviewed',
    measurement: 'Checklist 100% complete'
  });
  
  switch (category) {
    case 'design':
      criteria.push(
        {
          type: 'Quality',
          description: 'Mockups match brand guidelines and user requirements',
          measurement: 'Stakeholder approval on design'
        },
        {
          type: 'Usability',
          description: 'Designs are intuitive and follow UX best practices',
          measurement: 'Design passes usability review'
        },
        {
          type: 'Technical Readiness',
          description: 'Design is feasible to implement',
          measurement: 'Dev review confirms no blockers'
        },
        {
          type: 'Documentation',
          description: 'Comprehensive handoff documentation provided',
          measurement: 'Dev can implement without ambiguity'
        }
      );
      break;
      
    case 'development':
      criteria.push(
        {
          type: 'Functionality',
          description: 'All features work as specified',
          measurement: 'QA sign-off, zero critical bugs'
        },
        {
          type: 'Quality',
          description: 'Code meets quality standards',
          measurement: '>80% test coverage, code review approved'
        },
        {
          type: 'Performance',
          description: 'System meets performance requirements',
          measurement: 'Load tests pass, latency <200ms'
        },
        {
          type: 'Deployment',
          description: 'Ready for production deployment',
          measurement: 'Staging verified, rollback plan confirmed'
        }
      );
      break;
      
    case 'security':
      criteria.push(
        {
          type: 'Findings',
          description: 'All vulnerabilities identified and documented',
          measurement: 'Audit report complete with risk ratings'
        },
        {
          type: 'Critical Issues',
          description: 'No critical vulnerabilities left unaddressed',
          measurement: 'Remediation plan for all critical/high issues'
        },
        {
          type: 'Compliance',
          description: 'System meets compliance requirements',
          measurement: 'Verification against standards (OWASP, CIS, etc.)'
        },
        {
          type: 'Remediation',
          description: 'Clear implementation guidance provided',
          measurement: 'Team has roadmap to fix issues'
        }
      );
      break;
      
    case 'research':
      criteria.push(
        {
          type: 'Completeness',
          description: 'All research questions answered',
          measurement: 'Report addresses all questions'
        },
        {
          type: 'Accuracy',
          description: 'Findings are well-sourced and verified',
          measurement: 'All claims have citations'
        },
        {
          type: 'Actionability',
          description: 'Recommendations are concrete and implementable',
          measurement: 'Clear next steps defined'
        },
        {
          type: 'Clarity',
          description: 'Findings are clearly communicated',
          measurement: 'Stakeholders understand implications'
        }
      );
      break;
      
    case 'strategy':
      criteria.push(
        {
          type: 'Viability',
          description: 'Strategy is realistic and achievable',
          measurement: 'No unrealistic timelines or resource needs'
        },
        {
          type: 'Alignment',
          description: 'Strategy aligns with business goals',
          measurement: 'Leadership approval'
        },
        {
          type: 'Clarity',
          description: 'Strategy is clearly communicated',
          measurement: 'Team understands goals and approach'
        },
        {
          type: 'Measurability',
          description: 'Success is measurable with defined KPIs',
          measurement: 'Metrics dashboard can be tracked'
        }
      );
      break;
      
    case 'qa':
      criteria.push(
        {
          type: 'Coverage',
          description: 'All features and scenarios tested',
          measurement: '100% feature coverage'
        },
        {
          type: 'Quality',
          description: 'Critical issues identified and logged',
          measurement: 'No unlogged bugs in release'
        },
        {
          type: 'Sign-off',
          description: 'Product ready for release',
          measurement: 'QA formally approves or flags blockers'
        }
      );
      break;
      
    case 'infrastructure':
      criteria.push(
        {
          type: 'Reliability',
          description: 'System is highly available and resilient',
          measurement: '99.9%+ uptime SLA, <1hr RTO'
        },
        {
          type: 'Security',
          description: 'Infrastructure meets security standards',
          measurement: 'Security review passed'
        },
        {
          type: 'Scalability',
          description: 'System can handle load growth',
          measurement: 'Auto-scaling configured, load tests pass'
        },
        {
          type: 'Observability',
          description: 'Full visibility into system health',
          measurement: 'Monitoring, alerting, logs configured'
        }
      );
      break;
  }
  
  return criteria;
}

/**
 * Extract task dependencies
 */
function extractDependencies(task, state) {
  const dependencies = [];
  
  // Look for blockers or dependencies mentioned in description
  const desc = (task.description || '').toLowerCase();
  if (desc.includes('after') || desc.includes('depends') || desc.includes('requires') || desc.includes('following')) {
    dependencies.push({
      type: 'unknown',
      description: 'Check description for dependencies',
      task: 'Check with task creator'
    });
  }
  
  // Common dependencies by category
  if (task.category === 'development') {
    dependencies.push({
      type: 'design',
      description: 'Design specification must be approved first',
      task: 'design'
    });
  }
  
  if (task.category === 'qa') {
    dependencies.push({
      type: 'development',
      description: 'Code must be deployed to test environment',
      task: 'development'
    });
  }
  
  if (task.category === 'infrastructure') {
    dependencies.push({
      type: 'planning',
      description: 'Architecture review must be completed',
      task: 'planning'
    });
  }
  
  return dependencies;
}

/**
 * Identify potential risks
 */
function identifyRisks(task, category) {
  const risks = [];
  const desc = (task.description || '').toLowerCase();
  
  switch (category) {
    case 'design':
      risks.push(
        { risk: 'Scope creep', likelihood: 'medium', impact: 'medium', mitigation: 'Agree on scope upfront, manage change requests' },
        { risk: 'Stakeholder disagreement', likelihood: 'medium', impact: 'high', mitigation: 'Present multiple options early, get feedback in phases' }
      );
      break;
      
    case 'development':
      risks.push(
        { risk: 'Technical complexity', likelihood: 'high', impact: 'high', mitigation: 'Break into smaller tasks, spike on unknowns early' },
        { risk: 'Scope creep', likelihood: 'high', impact: 'high', mitigation: 'Strict scope management, track change requests' },
        { risk: 'Integration issues', likelihood: 'medium', impact: 'high', mitigation: 'Integration testing early and often' }
      );
      break;
      
    case 'security':
      risks.push(
        { risk: 'Undiscovered vulnerabilities', likelihood: 'medium', impact: 'critical', mitigation: 'Use multiple assessment methods, include expert review' },
        { risk: 'False positives', likelihood: 'medium', impact: 'medium', mitigation: 'Verify all findings, document methodology' }
      );
      break;
      
    case 'research':
      risks.push(
        { risk: 'Data quality issues', likelihood: 'medium', impact: 'medium', mitigation: 'Verify sources, cross-reference findings' },
        { risk: 'Biased conclusions', likelihood: 'low', impact: 'high', mitigation: 'Review methodology, sanity check results' }
      );
      break;
      
    case 'strategy':
      risks.push(
        { risk: 'Market conditions change', likelihood: 'medium', impact: 'high', mitigation: 'Build flexibility into plan, monitor key metrics' },
        { risk: 'Poor execution', likelihood: 'medium', impact: 'high', mitigation: 'Clear roadmap, frequent checkpoints' }
      );
      break;
      
    case 'qa':
      risks.push(
        { risk: 'Incomplete test coverage', likelihood: 'medium', impact: 'high', mitigation: 'Prioritize critical paths, use automation' },
        { risk: 'Test environment issues', likelihood: 'low', impact: 'medium', mitigation: 'Set up early, have backup plan' }
      );
      break;
      
    case 'infrastructure':
      risks.push(
        { risk: 'Deployment issues', likelihood: 'medium', impact: 'critical', mitigation: 'Comprehensive testing, clear rollback plan' },
        { risk: 'Performance degradation', likelihood: 'medium', impact: 'high', mitigation: 'Load testing, monitoring alerts' }
      );
      break;
  }
  
  // Add specific risks from description
  if (desc.includes('mobile') && !risks.some(r => r.risk.includes('mobile'))) {
    risks.push({
      risk: 'Mobile platform fragmentation',
      likelihood: 'medium',
      impact: 'medium',
      mitigation: 'Test on multiple devices/OS versions early'
    });
  }
  
  if (desc.includes('api') && !risks.some(r => r.risk.includes('integration'))) {
    risks.push({
      risk: 'API integration issues',
      likelihood: 'medium',
      impact: 'medium',
      mitigation: 'Create API contracts upfront, integration test early'
    });
  }
  
  return risks;
}

/**
 * Format briefing as JSON with proper structure
 */
function formatBriefing(briefing) {
  return {
    // Metadata
    id: briefing.id,
    taskId: briefing.taskId,
    generatedAt: briefing.generatedAt,
    
    // Task Information
    task: {
      title: briefing.title,
      description: briefing.description,
      category: briefing.category,
      priority: briefing.priority,
      status: briefing.status,
      assignedTo: {
        id: briefing.assignedTo,
        name: briefing.assignedAgentName,
        title: briefing.assignedAgentTitle
      },
      dueDate: briefing.dueDate
    },
    
    // Execution Plan
    executionPlan: {
      title: briefing.title,
      description: briefing.description,
      
      deliverables: briefing.deliverables,
      
      milestones: briefing.milestones.map(m => ({
        name: m.name,
        description: m.description,
        estimatedDays: m.day
      })),
      
      timeline: {
        estimatedHours: briefing.timeline.estimatedHours,
        estimatedDays: briefing.timeline.estimatedDays,
        summary: briefing.timeline.summary,
        breakdown: briefing.timeline.breakdown
      },
      
      resourcesNeeded: briefing.resourcesNeeded,
      
      successCriteria: briefing.successCriteria,
      
      dependencies: briefing.dependencies,
      
      risks: briefing.risks
    }
  };
}

/**
 * Generate briefings for all tasks
 */
function generateAllBriefings(state) {
  const briefings = [];
  
  if (!state.tasks || state.tasks.length === 0) {
    console.log('No tasks found in state');
    return briefings;
  }
  
  state.tasks.forEach(task => {
    try {
      const briefing = generateBriefing(task, state);
      briefing.risks = identifyRisks(task, briefing.category);
      briefings.push(formatBriefing(briefing));
    } catch (err) {
      console.error(`Error generating briefing for task ${task.id}:`, err.message);
    }
  });
  
  return briefings;
}

/**
 * Generate example briefings for demo/documentation
 */
function generateExampleBriefings(state) {
  const examples = [];
  
  // Example 1: Design Task
  const designTask = {
    id: 'task-iphone-missioncontrol-design',
    title: 'Design iOS Mission Control App - Phase 1',
    description: 'Create iPhone mockups and design specification for Mission Control iOS app. Screens: Task Board (Kanban), Agent Activity Feed, Team View, Settings. Deliverables: Figma file with high-fidelity mockups + design spec document. Platform: iOS 16+, iPhone SE through iPhone 15 Pro. Requirements: Native iOS patterns, WebSocket-ready, WCAG AA accessible, glassmorphic design.',
    category: 'design',
    priority: 'high',
    status: 'queued',
    assignedTo: 'johnny'
  };
  
  // Example 2: Development Task
  const devTask = {
    id: 'task-iphone-missioncontrol-api-hardening',
    title: 'API Hardening for iOS Mission Control - Phase 3',
    description: 'Audit Mission Control API endpoints for mobile compatibility. Add CORS headers for iOS bundle ID (com.elevationaiagent.missioncontrol). Ensure JWT auth flow works on mobile. Test API with iOS WebSocket client. Verify endpoints handle mobile-specific network conditions (reconnection, timeout). Deliverable: API audit report + implementation of mobile-required changes.',
    category: 'infrastructure',
    priority: 'high',
    status: 'queued',
    assignedTo: 'chief'
  };
  
  // Example 3: Strategy Task
  const strategyTask = {
    id: 'task-1773681978523',
    title: 'DC Northeast Growth',
    description: 'I would like to develop a plan to grow my business Pro-Tel. I would like to focus on the Data Center Structured cable installation market in Upstate NY and PA. The output should be daily emails to my work email tim.ryan@pro-tel.com that continue to guide me to the goal.',
    category: 'strategy',
    priority: 'medium',
    status: 'in-progress',
    assignedTo: 'laura'
  };
  
  // Example 4: Security Audit Task
  const securityTask = {
    id: 'task-1773616727446',
    title: 'Review API endpoint security',
    description: 'Audit task API endpoints for auth, validation, SQL injection vulnerabilities. Check rate limiting, input sanitization, and error handling. Deliverables: Security audit report with findings and remediation recommendations.',
    category: 'security',
    priority: 'high',
    status: 'rejected',
    assignedTo: 'opus'
  };
  
  // Example 5: Unified Dashboard Design
  const dashboardTask = {
    id: 'task-1773703901057_design_merge',
    title: 'Design: Unified Project/Task Status Dashboard',
    description: 'Design a merged dashboard that combines: 1. Projects page (overview of all projects) 2. Task Board (task management with kanban) 3. Task Progress (real-time tracking with timelines)\n\nGoals: Single unified view for project + task management, Show project overview + all tasks within each project, Real-time progress tracking, Timeline/Gantt-style view for task dependencies, Agent assignments visible, Status filtering\n\nDeliverables: Figma mockup of unified dashboard, Design spec (layouts, components, data flow), Navigation/interaction patterns, Mobile responsiveness considerations',
    category: 'design',
    priority: 'critical',
    status: 'queued',
    assignedTo: 'johnny'
  };
  
  const exampleTasks = [designTask, devTask, strategyTask, securityTask, dashboardTask];
  
  exampleTasks.forEach((task, index) => {
    try {
      const briefing = generateBriefing(task, state);
      briefing.risks = identifyRisks(task, briefing.category);
      examples.push({
        index: index + 1,
        briefing: formatBriefing(briefing)
      });
    } catch (err) {
      console.error(`Error generating example ${index + 1}:`, err.message);
    }
  });
  
  return examples;
}

/**
 * Main CLI handler
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const state = readState();
  
  if (command === '--examples') {
    // Generate example briefings
    console.log('📋 Generating example briefings for all 5 tasks...\n');
    const examples = generateExampleBriefings(state);
    
    examples.forEach(example => {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`EXAMPLE ${example.index}: ${example.briefing.task.title}`);
      console.log(`${'='.repeat(80)}\n`);
      console.log(JSON.stringify(example.briefing, null, 2));
    });
    
    // Write to file
    const outputFile = path.join(WORKSPACE, '.briefing-examples.json');
    fs.writeFileSync(outputFile, JSON.stringify(examples, null, 2));
    console.log(`\n✅ Examples saved to ${outputFile}`);
    
  } else if (command === '--all') {
    // Generate briefings for all tasks
    console.log('📋 Generating briefings for all tasks...\n');
    const briefings = generateAllBriefings(state);
    
    if (briefings.length === 0) {
      console.log('No tasks found');
      return;
    }
    
    briefings.forEach(briefing => {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`TASK: ${briefing.task.title}`);
      console.log(`${'='.repeat(80)}\n`);
      console.log(JSON.stringify(briefing, null, 2));
    });
    
    // Write to file
    const outputFile = path.join(WORKSPACE, '.briefings.json');
    fs.writeFileSync(outputFile, JSON.stringify({ briefings }, null, 2));
    console.log(`\n✅ Briefings saved to ${outputFile}`);
    
  } else if (command && !command.startsWith('--')) {
    // Generate briefing for specific task
    const taskId = command;
    const task = state.tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.error(`❌ Task not found: ${taskId}`);
      process.exit(1);
    }
    
    const briefing = generateBriefing(task, state);
    briefing.risks = identifyRisks(task, briefing.category);
    const formatted = formatBriefing(briefing);
    
    console.log(JSON.stringify(formatted, null, 2));
    
  } else {
    // Show usage
    console.log(`
📋 Briefing Generator

Usage:
  node scripts/generate-briefing.js <taskId>           Generate briefing for specific task
  node scripts/generate-briefing.js --all              Generate briefings for all tasks
  node scripts/generate-briefing.js --examples         Generate 5 example briefings

Examples:
  node scripts/generate-briefing.js task-1773616585822
  node scripts/generate-briefing.js --all > briefings.json
  node scripts/generate-briefing.js --examples

Output Format:
  JSON object with:
  - id: Briefing identifier
  - taskId: Linked task ID
  - task: Task metadata (title, description, category, etc.)
  - executionPlan: Structured plan with:
    - deliverables: Clear, actionable list of outputs
    - milestones: 3-5 key checkpoints with timeline
    - timeline: Estimated hours and days
    - resourcesNeeded: Team, tools, infrastructure, external resources
    - successCriteria: How to measure success
    - dependencies: Tasks that must complete first
    - risks: Potential issues and mitigations
`);
  }
}

// Run if called directly
if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

module.exports = {
  generateBriefing,
  generateAllBriefings,
  generateExampleBriefings,
  formatBriefing
};
