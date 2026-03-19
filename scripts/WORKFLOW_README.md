# Task Workflow Automation System

Complete task lifecycle automation with state tracking, progress monitoring, and automated execution.

## Overview

This system implements the following task lifecycle:

```
QUEUED → BRIEFING → APPROVED → IN-PROGRESS → REVIEW → COMPLETED
```

## Components

### 1. **task-workflow-executor.js** (Main Script)

The primary execution engine. Manages the complete workflow for all queued tasks.

#### Features

- **Automatic Briefing Generation**: Creates comprehensive briefing document including:
  - Deliverables (category-specific)
  - Milestones with time estimates
  - Timeline & deadlines
  - Quality gates & success criteria
  - Related tasks & dependencies
  - Execution parameters

- **User Approval Loop**: Interactive approval workflow
  - Displays full briefing with context
  - Prompts for user approval (yes/no)
  - Saves approval decision to state

- **Automated Agent Spawning**: Kicks off task execution
  - Spawns assigned agent with full context
  - Provides execution parameters (parallelization, reporting frequency)
  - Tracks session ID for monitoring

- **Execution Tracking**: Monitors progress
  - Tracks execution state via checkpoints
  - Monitors for completion or failures
  - Generates progress reports

- **State Management**: Persistent state across runs
  - Saves task status changes
  - Maintains execution history
  - Tracks workflow statistics

#### Usage

```bash
# Run workflow executor
node /Users/timothyryan/.openclaw/workspace/scripts/task-workflow-executor.js

# Process all queued tasks interactively
# For each task:
#   1. Display briefing
#   2. Wait for approval
#   3. Spawn agent if approved
#   4. Track execution
#   5. Generate summary
```

### 2. **workflow-state-manager.js** (State Management)

Utility module for persistent state tracking across sessions.

#### Methods

```javascript
const manager = new WorkflowStateManager();

// Save execution state
manager.saveTaskExecution(taskId, {
  status: 'in-progress',
  agentId: 'johnny',
  startedAt: Date.now(),
  checkpoints: []
});

// Add progress checkpoint
manager.addCheckpoint(taskId, {
  milestone: '50% Complete',
  details: 'Core work progressing'
});

// Mark as completed
manager.completeTaskExecution(taskId, {
  deliverables: [...],
  result: 'success'
});

// Mark as failed
manager.failTaskExecution(taskId, new Error('...'));

// Get all executions
const allExecutions = manager.getAllExecutions();

// Get stats
const stats = manager.getStats();
// { total: 5, completed: 2, inProgress: 1, failed: 0, pending: 2 }
```

### 3. **State Files**

#### `.mission-control-state.json`
Main state file containing:
- All tasks (with status, assignment, timeline)
- Team members & agents
- Contacts & configuration
- Activity log

#### `.workflow-state.json`
Workflow-specific tracking:
- Execution history
- Completed/failed count
- Per-task checkpoints
- Last run timestamp

#### `.workflow/task-*.json`
Individual task execution files:
- Execution timeline
- Checkpoints
- Results
- Errors (if any)

## Task Lifecycle Details

### 1. QUEUED State
- Task is created and approved by user
- Waiting in queue for workflow executor to process
- Status: `queued`

### 2. BRIEFING Generation
- Executor generates comprehensive briefing
- Analyzes task category, duration, dependencies
- Generates category-specific deliverables
- Creates milestone timeline
- Defines quality gates

#### Briefing Structure
```javascript
{
  taskId: "task-123",
  title: "Task Title",
  description: "...",
  assignedAgent: { id, name, title, specialty, model },
  priority: "high|medium|low",
  category: "design|infrastructure|strategy|research|code_review",
  dueDate: "ISO date",
  hoursUntilDue: 4,
  
  deliverables: [
    "Primary deliverable 1",
    "Primary deliverable 2",
    "..."
  ],
  
  milestones: [
    {
      name: "Milestone name",
      timeFromStart: 1,  // hours
      description: "What happens at this milestone"
    }
  ],
  
  timeline: {
    start: "ISO date",
    targetEnd: "ISO date",
    estimatedDurationHours: 2
  },
  
  context: {
    relatedTasks: [],
    dependencies: [],
    notes: ""
  },
  
  qualityGates: [
    { name: "Gate name", criteria: "Success criteria" }
  ]
}
```

### 3. APPROVED State
- User reviews briefing and approves
- Status changes from `queued` to `approved`
- Execution can now proceed
- Status: `approved`, `approvedAt` timestamp set

### 4. IN-PROGRESS State
- Agent spawned with full context
- Execution begins
- Periodic checkpoint updates
- Status: `in-progress`, `startedAt` timestamp set

### 5. REVIEW State
- Agent completes work
- Deliverables submitted for review
- Quality gates evaluated
- Status: `review`, result provided

### 6. COMPLETED State
- Review passed or requirements met
- Final deliverables stored
- Execution archived
- Status: `completed`, `completedAt` timestamp, result saved

## Queued Tasks (Current)

The system handles the following 5 queued tasks:

### 1. Design: iOS Mission Control App - Phase 1
- **Task ID**: `task-iphone-missioncontrol-design`
- **Assigned**: Johnny (Senior Designer)
- **Category**: Design
- **Priority**: High
- **Due**: 2026-03-19 23:59:59
- **Deliverables**:
  - Figma mockup (Task Board, Activity Feed, Team View, Settings)
  - Design specification
  - Interaction patterns
  - Accessibility compliance (WCAG AA)

### 2. API Hardening for iOS Mission Control - Phase 3
- **Task ID**: `task-iphone-missioncontrol-api-hardening`
- **Assigned**: Chief (Infrastructure Overseer)
- **Category**: Infrastructure
- **Priority**: High
- **Due**: 2026-03-19 23:59:59
- **Deliverables**:
  - API audit report
  - CORS configuration for iOS
  - JWT auth flow verification
  - Mobile network resilience testing
  - Implementation plan

### 3. Design: Unified Project/Task Status Dashboard
- **Task ID**: `task-1773703901057_design_merge`
- **Assigned**: Johnny (Senior Designer)
- **Category**: Design
- **Priority**: Critical
- **Due**: 2026-03-18 01:00:00
- **Deliverables**:
  - Figma mockup (merged dashboard)
  - Design specification
  - Navigation patterns
  - Mobile responsiveness plan

### 4. Plan: Unified Project/Task Status Backend & Logic
- **Task ID**: `task-1773703901059_execution_merge`
- **Assigned**: Chief (Infrastructure Overseer)
- **Category**: Infrastructure
- **Priority**: Critical
- **Due**: 2026-03-18 01:00:00
- **Deliverables**:
  - Architecture diagram
  - Database/API design spec
  - Frontend state model
  - Implementation roadmap
  - Risk assessment

### 5. Analyze Q2 Brand Positioning Strategy
- **Task ID**: `task-1773616585822`
- **Assigned**: Laura (Brand Strategy Manager)
- **Category**: Strategy
- **Priority**: Medium
- **Due**: 2026-03-19 23:59:59
- **Deliverables**:
  - Market analysis
  - Competitive landscape
  - Positioning recommendations
  - Implementation roadmap

## Execution Flow

```
START
  ↓
Load Mission Control State
  ↓
Get Queued Tasks
  ↓
FOR EACH TASK:
  ├─ Generate Briefing
  │   ├─ Analyze task category & duration
  │   ├─ Create deliverables list
  │   ├─ Generate milestone timeline
  │   ├─ Define quality gates
  │   └─ Find related tasks
  │
  ├─ Display Briefing to User
  │
  ├─ Prompt Approval
  │   └─ User: yes/no?
  │
  ├─ If Rejected:
  │   └─ Mark as rejected, continue to next
  │
  └─ If Approved:
      ├─ Update task status to approved
      ├─ Spawn execution agent
      │   ├─ Create execution context
      │   ├─ Save execution state
      │   └─ Pass briefing & context to agent
      ├─ Update task status to in-progress
      ├─ Track execution
      │   ├─ Monitor for checkpoints
      │   ├─ Track milestones
      │   └─ Report progress
      └─ Continue to next task
  ↓
Generate Summary Report
  ├─ Queue statistics
  ├─ Execution stats
  ├─ Files & locations
  └─ Next steps
  ↓
END
```

## Key Features by Category

### Design Tasks
- Deliverables: Mockups, design specs, components, accessibility
- Milestones: 25%, 50%, 75%, 100% completion
- Quality Gates: Design completeness, accessibility, specification clarity

### Infrastructure Tasks
- Deliverables: Architecture, specs, roadmap, risk assessment
- Milestones: Planning, primary work, review, final delivery
- Quality Gates: Technical accuracy, security, completeness

### Strategy Tasks
- Deliverables: Analysis, recommendations, roadmap, metrics
- Milestones: Research, analysis, planning, delivery
- Quality Gates: Research quality, actionability, alignment

### Research Tasks
- Deliverables: Report, visualizations, insights, recommendations
- Milestones: Initial findings, analysis, synthesis
- Quality Gates: Source quality, insight depth, clarity

### Code Review Tasks
- Deliverables: Review report, vulnerability assessment, recommendations
- Milestones: Initial scan, deep review, findings synthesis
- Quality Gates: Technical accuracy, security, completeness

## AI Agent Velocity Integration

This system implements the **AI Agent Velocity Principle**:
- Estimates and plans at **AI agent pace** (hours/days, not weeks)
- Compresses timelines by **5-10x** vs. human expectations
- **Parallelizes** independent work
- Uses **aggressive delegation** with automatic spawning

### Timeline Compression
- Design tasks: 1-2 hours
- Infrastructure tasks: 2-4 hours
- Strategy tasks: 2-4 hours
- Research tasks: 1-2 hours
- Code review tasks: 1-3 hours

## Running the Executor

### Simple Run
```bash
node /Users/timothyryan/.openclaw/workspace/scripts/task-workflow-executor.js
```

### With Output Logging
```bash
node /Users/timothyryan/.openclaw/workspace/scripts/task-workflow-executor.js | tee workflow-$(date +%s).log
```

### Automated (via cron)
```bash
# Run every 2 hours
0 */2 * * * cd /Users/timothyryan/.openclaw/workspace/scripts && node task-workflow-executor.js >> workflow.log 2>&1
```

## State Files Location

All state files are stored in:
- `/Users/timothyryan/.openclaw/workspace/` (main)
- `/Users/timothyryan/.openclaw/workspace/.workflow/` (execution tracking)

### Files Created/Used
- `.mission-control-state.json` - Main state (read/write)
- `.workflow-state.json` - Workflow tracking (read/write)
- `.workflow/task-*.json` - Individual task executions (read/write)

## Integration with OpenClaw

### Agent Spawning
When approved, tasks spawn subagents:
```bash
openclaw spawn-subagent \
  --agent={agentId} \
  --briefing={briefingJson} \
  --context={contextFile}
```

### Session Tracking
- Each spawned agent gets a session ID
- Progress tracked via `openclaw session status`
- Results collected via `openclaw session results`

### Coordination
- Main executor (Lucy) orchestrates
- Subagents execute assigned tasks
- Results collected and stored
- State synced back to main state file

## Error Handling

Tasks can fail at:
1. **Briefing Generation** - Usually config issue
2. **Approval** - User rejects
3. **Agent Spawning** - Agent unavailable
4. **Execution** - Agent encounters error

Failed tasks:
- Marked with `status: 'error'` or `'failed'`
- Error details stored in execution state
- Can be retried manually
- Escalation alerted to leadership

## Monitoring & Reporting

### Real-time Monitoring
```bash
# Check execution stats
node -e "const m = require('./workflow-state-manager'); console.log(new m().getStats())"
```

### Summary Report (Built-in)
Generated at end of each executor run showing:
- Queue status
- Execution statistics
- In-progress tasks
- Completed/failed counts
- State file locations

## Future Enhancements

- [ ] WebSocket-based real-time tracking
- [ ] Slack/Telegram status notifications
- [ ] Automatic escalation on timeout
- [ ] Parallel task execution limits
- [ ] Recovery from interrupted executions
- [ ] Per-agent performance analytics
- [ ] Milestone checkpoint webhooks
- [ ] Automatic task dependency resolution
