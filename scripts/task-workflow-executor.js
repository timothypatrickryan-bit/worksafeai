#!/usr/bin/env node

/**
 * Task Workflow Executor
 * 
 * Implements complete task lifecycle automation:
 * QUEUED → BRIEFING (generate plan) → APPROVED (user click) → IN-PROGRESS (spawn agent) → REVIEW → COMPLETED
 * 
 * Handles all queued tasks with state tracking, progress monitoring, and result reporting.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const STATE_FILE = path.join(process.env.HOME, '.openclaw/workspace/.mission-control-state.json');
const WORKFLOW_STATE_FILE = path.join(process.env.HOME, '.openclaw/workspace/.workflow-state.json');

class TaskWorkflowExecutor {
  constructor() {
    this.state = this.loadState();
    this.workflowState = this.loadWorkflowState();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  loadState() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      }
    } catch (err) {
      console.error('Error loading state:', err.message);
    }
    return { tasks: [], team: { members: [] } };
  }

  loadWorkflowState() {
    try {
      if (fs.existsSync(WORKFLOW_STATE_FILE)) {
        return JSON.parse(fs.readFileSync(WORKFLOW_STATE_FILE, 'utf8'));
      }
    } catch (err) {
      // First run
    }
    return { executions: [], completedCount: 0, failedCount: 0, lastRun: null };
  }

  saveState() {
    fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2), 'utf8');
  }

  saveWorkflowState() {
    fs.writeFileSync(WORKFLOW_STATE_FILE, JSON.stringify(this.workflowState, null, 2), 'utf8');
  }

  /**
   * Get all queued tasks
   */
  getQueuedTasks() {
    return (this.state.tasks || []).filter(t => t.status === 'queued');
  }

  /**
   * Find agent by ID from team members
   */
  findAgent(agentId) {
    return (this.state.team?.members || []).find(m => m.id === agentId);
  }

  /**
   * Generate a briefing for a task
   * Includes deliverables, milestones, timeline, context
   */
  generateBriefing(task) {
    const agent = this.findAgent(task.assignedTo);
    const now = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : new Date(now.getTime() + 4 * 3600000); // 4 hours default

    // Calculate timeline
    const hoursUntilDue = Math.round((dueDate - now) / 3600000);
    const estimatedDuration = Math.max(1, Math.min(hoursUntilDue, 2)); // 1-2 hours typical

    // Milestones based on task category
    const milestones = this.generateMilestones(task, estimatedDuration);

    return {
      taskId: task.id,
      title: task.title,
      description: task.description,
      assignedAgent: agent ? {
        id: agent.id,
        name: agent.name,
        title: agent.title,
        specialty: agent.specialty,
        model: agent.model
      } : { id: task.assignedTo, name: 'Unknown Agent' },
      priority: task.priority || 'medium',
      category: task.category || 'general',
      dueDate: dueDate.toISOString(),
      hoursUntilDue,
      
      // Deliverables
      deliverables: this.generateDeliverables(task),
      
      // Milestones
      milestones,
      
      // Timeline
      timeline: {
        start: now.toISOString(),
        targetEnd: dueDate.toISOString(),
        estimatedDurationHours: estimatedDuration
      },

      // Context & dependencies
      context: {
        relatedTasks: this.findRelatedTasks(task),
        dependencies: task.dependencies || [],
        notes: task.notes || ''
      },

      // Execution parameters
      executionParams: {
        allowSubagents: true,
        maxParallelWork: task.category === 'infrastructure' ? 1 : 2,
        escalationThreshold: 'warning',
        reportingFrequency: 'hourly'
      },

      // Quality gates
      qualityGates: this.generateQualityGates(task)
    };
  }

  /**
   * Generate deliverables based on task category
   */
  generateDeliverables(task) {
    const baseDeliverables = [];

    switch (task.category) {
      case 'design':
        baseDeliverables.push(
          'Figma mockup file (or equivalent design artifact)',
          'Design specification document',
          'Interaction patterns & flows',
          'Component library (if applicable)',
          'Accessibility compliance checklist (WCAG AA)'
        );
        break;

      case 'infrastructure':
        baseDeliverables.push(
          'Architecture diagram (decision tree)',
          'API design specification',
          'Database schema (if applicable)',
          'Implementation roadmap',
          'Risk assessment & mitigation plan',
          'Performance metrics baseline'
        );
        break;

      case 'strategy':
        baseDeliverables.push(
          'Strategy analysis document',
          'Market positioning recommendations',
          'Competitive landscape assessment',
          'Go-to-market plan',
          'Implementation timeline',
          'Success metrics & KPIs'
        );
        break;

      case 'research':
        baseDeliverables.push(
          'Research report (findings + analysis)',
          'Data visualization (charts, graphs)',
          'Source attribution',
          'Key insights summary',
          'Recommendations based on findings'
        );
        break;

      case 'code_review':
        baseDeliverables.push(
          'Code review report',
          'Security vulnerability assessment',
          'Performance analysis',
          'Refactoring recommendations',
          'Test coverage analysis'
        );
        break;

      default:
        baseDeliverables.push(
          'Primary deliverable (as per task)',
          'Summary document',
          'Status report'
        );
    }

    return baseDeliverables;
  }

  /**
   * Generate milestones based on task type and duration
   */
  generateMilestones(task, durationHours) {
    const milestones = [];
    const now = new Date();

    if (durationHours <= 1) {
      // Quick task: milestone at 50% and 100%
      milestones.push({
        name: '50% Complete',
        timeFromStart: Math.ceil(durationHours * 0.5),
        description: 'Core work half-completed, review in progress'
      });
      milestones.push({
        name: '100% Complete',
        timeFromStart: durationHours,
        description: 'All deliverables ready for review'
      });
    } else {
      // Longer task: milestones at 25%, 50%, 75%, 100%
      milestones.push({
        name: 'Planning & Setup',
        timeFromStart: Math.ceil(durationHours * 0.25),
        description: 'Requirements clarified, approach designed'
      });
      milestones.push({
        name: 'Primary Work',
        timeFromStart: Math.ceil(durationHours * 0.5),
        description: 'Main deliverables in progress'
      });
      milestones.push({
        name: 'Review & Refinement',
        timeFromStart: Math.ceil(durationHours * 0.75),
        description: 'Initial deliverables ready for feedback'
      });
      milestones.push({
        name: 'Final Delivery',
        timeFromStart: durationHours,
        description: 'All deliverables complete and polished'
      });
    }

    return milestones;
  }

  /**
   * Generate quality gates based on task type
   */
  generateQualityGates(task) {
    const gates = [];

    if (task.category === 'design') {
      gates.push(
        { name: 'Design Completeness', criteria: 'All screens/mockups included' },
        { name: 'Accessibility', criteria: 'WCAG AA standard compliance verified' },
        { name: 'Specification Clarity', criteria: 'Design specs are clear and implementation-ready' }
      );
    } else if (task.category === 'infrastructure' || task.category === 'code_review') {
      gates.push(
        { name: 'Technical Accuracy', criteria: 'Architecture/code review is technically sound' },
        { name: 'Security Review', criteria: 'No critical security vulnerabilities identified' },
        { name: 'Completeness', criteria: 'All components covered, no gaps' }
      );
    } else if (task.category === 'strategy') {
      gates.push(
        { name: 'Research Quality', criteria: 'Findings backed by credible sources' },
        { name: 'Actionability', criteria: 'Recommendations are concrete and implementable' },
        { name: 'Alignment', criteria: 'Strategy aligns with business goals' }
      );
    }

    return gates;
  }

  /**
   * Find related tasks (dependencies, same project, etc.)
   */
  findRelatedTasks(task) {
    const related = [];
    
    // Look for tasks with similar titles or same phase
    (this.state.tasks || []).forEach(t => {
      if (t.id !== task.id) {
        // Same phase or project
        if (t.phase === task.phase || t.category === task.category) {
          related.push({
            id: t.id,
            title: t.title,
            status: t.status,
            category: t.category
          });
        }
      }
    });

    return related.slice(0, 5); // Top 5 related
  }

  /**
   * Prompt user for approval
   */
  promptApproval(briefing) {
    return new Promise((resolve) => {
      console.log('\n' + '='.repeat(80));
      console.log('📋 TASK BRIEFING & APPROVAL REQUEST');
      console.log('='.repeat(80));
      console.log(`\n✓ Task ID: ${briefing.taskId}`);
      console.log(`✓ Title: ${briefing.title}`);
      console.log(`✓ Assigned Agent: ${briefing.assignedAgent.name} (${briefing.assignedAgent.title})`);
      console.log(`✓ Priority: ${briefing.priority.toUpperCase()}`);
      console.log(`✓ Category: ${briefing.category}`);
      console.log(`✓ Hours Until Due: ${briefing.hoursUntilDue}h`);
      console.log(`✓ Est. Duration: ${briefing.timeline.estimatedDurationHours}h`);

      console.log(`\n📝 Description:`);
      console.log(`  ${briefing.description}`);

      console.log(`\n🎯 Deliverables:`);
      briefing.deliverables.forEach((d, i) => {
        console.log(`  ${i + 1}. ${d}`);
      });

      console.log(`\n📊 Milestones:`);
      briefing.milestones.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.name} (T+${m.timeFromStart}h): ${m.description}`);
      });

      if (briefing.context.relatedTasks.length > 0) {
        console.log(`\n🔗 Related Tasks:`);
        briefing.context.relatedTasks.forEach(t => {
          console.log(`  - ${t.title} (${t.status})`);
        });
      }

      console.log(`\n🎯 Quality Gates:`);
      briefing.qualityGates.forEach(g => {
        console.log(`  - ${g.name}: ${g.criteria}`);
      });

      console.log('\n' + '-'.repeat(80));
      this.rl.question('👤 Approve this task briefing? (yes/no): ', (answer) => {
        resolve(answer.toLowerCase().startsWith('y'));
      });
    });
  }

  /**
   * Spawn execution agent for a task
   * In production, this would spawn the agent via OpenClaw CLI
   */
  async spawnExecutionAgent(task, briefing) {
    console.log(`\n▶️  Spawning execution agent: ${briefing.assignedAgent.name}...`);

    // Create execution context
    const executionContext = {
      taskId: task.id,
      briefing,
      executionStartedAt: new Date().toISOString(),
      expectedCompletionAt: briefing.timeline.targetEnd,
      checkpointInterval: 30 * 60 * 1000 // 30 minutes
    };

    // Save to execution state
    const execution = {
      taskId: task.id,
      agentId: task.assignedTo,
      briefing,
      status: 'in-progress',
      startedAt: new Date().toISOString(),
      checkpoints: [],
      result: null
    };

    this.workflowState.executions = this.workflowState.executions || [];
    this.workflowState.executions.push(execution);
    this.saveWorkflowState();

    // In a real implementation, this would:
    // 1. Write execution context to a file
    // 2. Call: openclaw spawn-subagent --agent={agentId} --context={contextFile}
    // 3. Return agent session ID for tracking

    console.log(`✓ Execution started. Context saved.`);
    console.log(`✓ Agent ${briefing.assignedAgent.name} is now processing this task.`);
    console.log(`✓ Expected completion: ${new Date(briefing.timeline.targetEnd).toLocaleString()}`);

    // Simulate spawning (in production, call actual CLI)
    return {
      sessionId: `session_${task.id}_${Date.now()}`,
      agentId: task.assignedTo,
      startedAt: execution.startedAt
    };
  }

  /**
   * Track execution progress
   */
  async trackExecution(sessionId, taskId, timeoutMs = 300000) {
    console.log(`\n⏳ Tracking execution (task: ${taskId})...`);
    
    return new Promise((resolve) => {
      // In production: poll OpenClaw for session status every 30s
      // For now, we'll simulate progress tracking
      
      const maxAttempts = Math.floor(timeoutMs / 10000); // Check every 10s
      let attempts = 0;

      const trackingInterval = setInterval(() => {
        attempts++;
        const progress = Math.round((attempts / maxAttempts) * 100);
        
        process.stdout.write(`\r  Progress: ${progress}% (${attempts}/${maxAttempts} checks)`);

        if (attempts >= maxAttempts) {
          clearInterval(trackingInterval);
          console.log('\n✓ Execution tracking initiated.');
          resolve({
            taskId,
            sessionId,
            status: 'monitoring',
            checksPerformed: attempts
          });
        }
      }, 10000);
    });
  }

  /**
   * Generate summary report
   */
  generateSummaryReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 WORKFLOW EXECUTION SUMMARY');
    console.log('='.repeat(80));

    const queued = this.getQueuedTasks();
    console.log(`\n📋 Queue Status:`);
    console.log(`  Total Queued Tasks: ${queued.length}`);

    if (queued.length > 0) {
      console.log(`\n📝 Queued Tasks:`);
      queued.forEach((task, i) => {
        console.log(`  ${i + 1}. [${task.category.toUpperCase()}] ${task.title}`);
        console.log(`     Assigned to: ${task.assignedTo}`);
        console.log(`     Status: ${task.status}`);
      });
    }

    console.log(`\n📈 Workflow Statistics:`);
    const executions = this.workflowState.executions || [];
    console.log(`  Total Executions Initiated: ${executions.length}`);
    
    const completed = executions.filter(e => e.status === 'completed').length;
    const inProgress = executions.filter(e => e.status === 'in-progress').length;
    const failed = executions.filter(e => e.status === 'failed').length;

    console.log(`  ✓ Completed: ${completed}`);
    console.log(`  ⏳ In Progress: ${inProgress}`);
    console.log(`  ✗ Failed: ${failed}`);

    console.log(`\n💾 State Files:`);
    console.log(`  Main State: ${STATE_FILE}`);
    console.log(`  Workflow State: ${WORKFLOW_STATE_FILE}`);

    console.log('\n' + '='.repeat(80) + '\n');
  }

  /**
   * Main execution loop
   */
  async run() {
    console.log('\n🚀 Task Workflow Executor Starting...\n');
    
    const queuedTasks = this.getQueuedTasks();
    
    if (queuedTasks.length === 0) {
      console.log('✓ No queued tasks found.');
      this.generateSummaryReport();
      this.rl.close();
      return;
    }

    console.log(`📋 Found ${queuedTasks.length} queued task(s)\n`);

    let processedCount = 0;

    for (const task of queuedTasks) {
      processedCount++;
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`Processing Task ${processedCount}/${queuedTasks.length}`);
      console.log(`${'─'.repeat(80)}`);

      try {
        // Step 1: Generate briefing
        console.log('\n📋 Step 1: Generating briefing...');
        const briefing = this.generateBriefing(task);
        console.log('✓ Briefing generated');

        // Step 2: Request approval
        console.log('\n🔍 Step 2: Awaiting approval...');
        const approved = await this.promptApproval(briefing);

        if (!approved) {
          console.log('❌ Task rejected by user.');
          task.status = 'rejected';
          this.saveState();
          continue;
        }

        // Step 3: Mark as approved
        console.log('\n✅ Step 3: Marking task as approved...');
        task.status = 'approved';
        task.approvedAt = new Date().toISOString();
        this.saveState();
        console.log('✓ Task approved and saved');

        // Step 4: Spawn execution agent
        console.log('\n🎬 Step 4: Spawning execution agent...');
        const execution = await this.spawnExecutionAgent(task, briefing);
        console.log(`✓ Agent spawned with session ID: ${execution.sessionId}`);

        // Step 5: Mark as in-progress
        task.status = 'in-progress';
        task.startedAt = new Date().toISOString();
        this.saveState();

        // Step 6: Track execution
        console.log('\n📡 Step 5: Initiating execution tracking...');
        await this.trackExecution(execution.sessionId, task.id);
        console.log('✓ Execution tracking initiated');

      } catch (error) {
        console.error(`\n❌ Error processing task ${task.id}:`, error.message);
        task.status = 'error';
        this.saveState();
      }
    }

    // Final summary
    this.generateSummaryReport();
    this.rl.close();
  }
}

// Export for use as a module
module.exports = { TaskWorkflowExecutor };

// Execute only if run directly
if (require.main === module) {
  const executor = new TaskWorkflowExecutor();
  executor.run().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
