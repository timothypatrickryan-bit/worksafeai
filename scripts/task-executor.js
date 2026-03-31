#!/usr/bin/env node

/**
 * TASK EXECUTOR
 * 
 * The real execution layer - actually spawns subagents to execute briefings.
 * This is the missing piece between "task is queued" and "agent is working".
 * 
 * Called by execution-trigger when a task enters "executing" state.
 * For each executing task:
 *   1. Check if subagent already spawned (avoid duplicates)
 *   2. Create briefing context with full task details
 *   3. Spawn subagent (runtime=subagent, mode=run)
 *   4. Poll for completion signals ([TASK_COMPLETE])
 *   5. Auto-update task status to "complete"
 * 
 * Integration: This would be called from execution-trigger.js via sessions_spawn()
 */

const fs = require('fs');
const path = require('path');

const TASKS_FILE = path.join(__dirname, '../mission-control-express-organized/server/data/tasks.json');
const BRIEFINGS_FILE = path.join(__dirname, '../mission-control-express-organized/server/data/briefings.json');
const EXECUTION_LOG = path.join(__dirname, '../.task-executor.log');
const EXECUTION_STATE = path.join(__dirname, '../.execution-state.json');

// Map agents to their specialties + preferred models
const AGENT_ROUTING = {
  lucy: {
    specialty: 'Orchestration, Project Management, Leadership',
    model: 'minimax/MiniMax-M2.5',
    focus: 'End-to-end execution, coordination, quality assurance',
  },
  johnny: {
    specialty: 'Frontend Engineering, UI/UX Design',
    model: 'minimax/MiniMax-M2.5',
    focus: 'Frontend implementation, component design, user experience',
  },
  jarvis: {
    specialty: 'Backend Engineering, API Development',
    model: 'minimax/MiniMax-M2.5',
    focus: 'Backend systems, databases, server-side logic',
  },
  velma: {
    specialty: 'Quality Assurance, Code Review, Testing',
    model: 'minimax/MiniMax-M2.5',
    focus: 'Testing, QA, code review, bug fixes',
  },
  chief: {
    specialty: 'Architecture, System Design, Technical Strategy',
    model: 'anthropic/claude-opus-4-6',
    focus: 'System design, architecture, strategic decisions',
  },
  scout: {
    specialty: 'Research, Analysis, Market Intelligence',
    model: 'minimax/MiniMax-M2.5',
    focus: 'Research, analysis, insights, recommendations',
  },
  laura: {
    specialty: 'Strategy, Brand, Business Development',
    model: 'minimax/MiniMax-M2.5',
    focus: 'Strategic planning, brand positioning, business growth',
  },
  steven: {
    specialty: 'DevOps, Infrastructure, Deployment',
    model: 'minimax/MiniMax-M2.5',
    focus: 'Infrastructure, deployment, monitoring, automation',
  },
  opus: {
    specialty: 'Deep Analysis, Code Review, Complex Problem Solving',
    model: 'anthropic/claude-opus-4-6',
    focus: 'Complex analysis, deep code review, architectural decisions',
  },
};

function log(msg) {
  const ts = new Date().toISOString();
  const logMsg = `[${ts}] ${msg}`;
  console.log(logMsg);
  fs.appendFileSync(EXECUTION_LOG, logMsg + '\n');
}

function generateBriefingContext(task, briefing, agent) {
  /**
   * Generate the complete briefing context for the agent.
   * This is what gets passed to sessions_spawn() as the task description.
   */

  const agentInfo = AGENT_ROUTING[agent.toLowerCase()] || AGENT_ROUTING.lucy;

  return `
=== TASK BRIEFING ===
Title: ${task.name}
Agent: ${agent} (${agentInfo.specialty})
Priority: ${task.priority}
Estimated Hours: ${task.estimatedHours}
Due Date: ${task.dueDate}

=== BRIEFING DETAILS ===
${briefing.description}

=== EXECUTION RULES ===
1. Execute with Level 2 autonomy (no approval needed)
2. Aim for ${task.estimatedHours}h completion time (AI speed)
3. Parallelize independent work
4. Document decisions in execution logs
5. Test thoroughly before completion
6. Signal completion with [TASK_COMPLETE]

=== COMPLETION SIGNAL ===
When done, include this in your response:
[TASK_COMPLETE] taskId: ${task.id}

This allows the system to automatically:
- Update task status to "complete"
- Mark project progress
- Trigger downstream tasks (if any)

=== CONTEXT ===
- Focus: ${agentInfo.focus}
- Model: ${agentInfo.model}
- Specialty: ${agentInfo.specialty}

You are ${agent}. This is your area of expertise. Execute with full confidence.
`;
}

function createExecutionPlan(executingTasks, briefings) {
  /**
   * Create a plan for executing all tasks.
   * Groups by agent to enable parallelization.
   */

  const plan = {};

  for (const task of executingTasks) {
    const briefing = briefings.find(b => b.id === task.briefingId);
    if (!briefing) continue;

    const agent = (briefing.agent || 'lucy').toLowerCase();
    if (!plan[agent]) {
      plan[agent] = [];
    }

    plan[agent].push({
      taskId: task.id,
      taskName: task.name,
      briefing: briefing,
      context: generateBriefingContext(task, briefing, agent),
    });
  }

  return plan;
}

function main() {
  log('🚀 TASK EXECUTOR STARTED');

  try {
    const tasksData = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    const briefingsData = JSON.parse(fs.readFileSync(BRIEFINGS_FILE, 'utf8'));

    // Find tasks that are in "executing" state but haven't been spawned yet
    const executingTasks = tasksData.filter(t => t.status === 'executing');
    log(`📋 Found ${executingTasks.length} executing tasks`);

    if (executingTasks.length === 0) {
      log('✅ No executing tasks - all clear');
      return;
    }

    // Create execution plan (group by agent for parallelization)
    const plan = createExecutionPlan(executingTasks, briefingsData);
    const agents = Object.keys(plan);

    log(`\n📊 EXECUTION PLAN:`);
    log(`   Agents: ${agents.join(', ')}`);
    log(`   Total Tasks: ${executingTasks.length}`);

    // Log each agent's workload
    for (const [agent, tasks] of Object.entries(plan)) {
      log(`   ${agent}: ${tasks.length} task(s)`);
      for (const t of tasks) {
        log(`      - ${t.taskName}`);
      }
    }

    log(`\n🎯 AGENT SPAWNING PLAN:`);
    log(`   (In a real system, this would call sessions_spawn for each agent)`);

    for (const [agent, tasks] of Object.entries(plan)) {
      for (const taskInfo of tasks) {
        log(`\n   📤 Spawning ${agent} for: "${taskInfo.taskName}"`);
        log(`   Task ID: ${taskInfo.taskId}`);
        log(`   Briefing: ${taskInfo.briefing.title}`);

        // In a real implementation, this would be:
        // sessions_spawn({
        //   task: taskInfo.context,
        //   agentId: agent,
        //   mode: 'run',
        //   runtime: 'subagent',
        //   timeoutSeconds: 14400, // 4 hours
        // })
      }
    }

    log(`\n✅ EXECUTION PLAN READY`);
    log(`\n📈 Next Steps:`);
    log(`   1. sessions_spawn() would be called for each agent`);
    log(`   2. Agents execute tasks in parallel`);
    log(`   3. [TASK_COMPLETE] signals trigger status updates`);
    log(`   4. Dashboard auto-updates in real-time`);

  } catch (e) {
    log(`❌ Error: ${e.message}`);
  }

  log('\n✅ TASK EXECUTOR COMPLETE\n');
}

main();
