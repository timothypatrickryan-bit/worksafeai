# Task Workflow Architecture

Complete system architecture for task automation, state management, and agent coordination.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TASK WORKFLOW EXECUTOR SYSTEM                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Task Workflow Executor (task-workflow-executor.js)             │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  • Load state from .mission-control-state.json                  │   │
│  │  • Get queued tasks (status == 'queued')                        │   │
│  │  • FOR EACH queued task:                                        │   │
│  │    └─ Generate briefing                                         │   │
│  │    └─ Display & request approval                                │   │
│  │    └─ Spawn agent if approved                                   │   │
│  │    └─ Track execution progress                                  │   │
│  │  • Generate summary report                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                           ↓ ↓ ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  State Management Layer (workflow-state-manager.js)             │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  • Load/save execution state                                    │   │
│  │  • Track checkpoints & milestones                               │   │
│  │  • Record completions & failures                                │   │
│  │  • Generate statistics                                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                           ↓ ↓ ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Persistent State Files                                         │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  .mission-control-state.json       (main state)                │   │
│  │  .workflow-state.json              (workflow tracking)         │   │
│  │  .workflow/task-*.json             (per-task execution)        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Agent Execution Layer (OpenClaw Integration)                   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  • Spawn subagent with context                                  │   │
│  │  • Pass briefing & execution parameters                         │   │
│  │  • Monitor session status                                       │   │
│  │  • Collect results                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Task Workflow Executor (`task-workflow-executor.js`)

**Responsibilities**:
- Load and validate mission control state
- Identify queued tasks
- Generate briefings for each task
- Display briefings to user
- Request and record approval
- Spawn execution agents
- Track execution progress
- Generate summary reports

**Key Methods**:
```javascript
class TaskWorkflowExecutor {
  loadState()                    // Load .mission-control-state.json
  getQueuedTasks()              // Filter tasks with status == 'queued'
  generateBriefing(task)        // Create comprehensive briefing
  generateDeliverables(task)    // Category-specific deliverables
  generateMilestones(task)      // Milestone timeline
  generateQualityGates(task)    // Success criteria
  promptApproval(briefing)      // Interactive user approval
  spawnExecutionAgent(task)     // Kick off agent execution
  trackExecution(sessionId)     // Monitor progress
  generateSummaryReport()       // Final report
}
```

**State Mutations**:
```
QUEUED → (generate briefing) → 
         (user prompt) → 
         (approval?) → 
         APPROVED → (spawn agent) → 
         IN-PROGRESS → (track) → 
         REVIEW/COMPLETED
```

### 2. State Management (`workflow-state-manager.js`)

**Responsibilities**:
- Manage `.workflow/` directory for task executions
- Track execution state per task
- Record checkpoints and milestones
- Handle completion/failure recording
- Generate statistics

**Key Methods**:
```javascript
class WorkflowStateManager {
  saveTaskExecution(taskId, execution)
  loadTaskExecution(taskId)
  addCheckpoint(taskId, checkpoint)
  completeTaskExecution(taskId, result)
  failTaskExecution(taskId, error)
  getAllExecutions()
  getStats()
}
```

**State Structure**:
```json
{
  ".workflow/task-id.json": {
    "taskId": "task-123",
    "agentId": "johnny",
    "status": "in-progress",
    "startedAt": "ISO date",
    "checkpoints": [
      {
        "milestone": "50% Complete",
        "details": "...",
        "timestamp": "ISO date"
      }
    ],
    "result": null
  }
}
```

### 3. State Files

#### `.mission-control-state.json`
Primary source of truth. Contains:

```json
{
  "tasks": [
    {
      "id": "task-123",
      "title": "...",
      "description": "...",
      "assignedTo": "johnny",
      "status": "queued|approved|in-progress|review|completed|rejected|error",
      "category": "design|infrastructure|strategy|research|code_review",
      "priority": "high|medium|low",
      "dueDate": "ISO date",
      "createdAt": "ISO date",
      "approvedAt": "ISO date (optional)",
      "startedAt": "ISO date (optional)",
      "completedAt": "ISO date (optional)"
    }
  ],
  "team": {
    "members": [
      {
        "id": "johnny",
        "name": "Johnny",
        "title": "Senior Designer",
        "type": "subagent",
        "model": "Claude Sonnet 4.6",
        "specialty": "UI/UX design, wireframes, mockups"
      }
    ]
  }
}
```

#### `.workflow-state.json`
Workflow-specific tracking:

```json
{
  "initialized": true,
  "initializationDate": "ISO date",
  "executions": [
    {
      "taskId": "task-123",
      "agentId": "johnny",
      "briefing": { /* full briefing */ },
      "status": "in-progress|completed|failed",
      "startedAt": "ISO date",
      "checkpoints": []
    }
  ],
  "completedCount": 0,
  "failedCount": 0,
  "lastRun": "ISO date"
}
```

#### `.workflow/task-*.json`
Per-task execution details:

```json
{
  "taskId": "task-123",
  "agentId": "johnny",
  "status": "in-progress|completed|failed",
  "startedAt": "ISO date",
  "completedAt": "ISO date (optional)",
  "failedAt": "ISO date (optional)",
  "checkpoints": [
    {
      "milestone": "50% Complete",
      "details": "Core work progressing",
      "timestamp": "ISO date"
    }
  ],
  "result": null,
  "error": null
}
```

## Data Flow Diagrams

### Briefing Generation Flow

```
Task (from state)
  ↓
├─ Task ID
├─ Title & Description
├─ Assigned Agent
├─ Category
├─ Priority
└─ Due Date
  ↓
Briefing Generator
  ├─ Analyze Category
  │  └─ Design? Infrastructure? Strategy?
  │
  ├─ Generate Deliverables
  │  └─ Category-specific list
  │
  ├─ Calculate Timeline
  │  ├─ Time until due
  │  └─ Estimate duration
  │
  ├─ Generate Milestones
  │  ├─ Short task: 50%, 100%
  │  └─ Long task: 25%, 50%, 75%, 100%
  │
  ├─ Define Quality Gates
  │  └─ Category-specific success criteria
  │
  └─ Find Related Tasks
     └─ Same category or phase
  ↓
Briefing Object
  ├─ Task metadata
  ├─ Deliverables []
  ├─ Milestones []
  ├─ Quality Gates []
  ├─ Timeline {}
  └─ Context {}
  ↓
Display to User → Approval Prompt
```

### Approval & Execution Flow

```
Briefing Displayed
  ↓
User Prompt: "Approve? (yes/no)"
  ↓
  ├─ NO
  │  └─ Mark task as rejected
  │     └─ Continue to next task
  │
  └─ YES
     ├─ Update task.status → "approved"
     ├─ Set task.approvedAt
     ├─ Save state
     │
     ├─ Create execution context
     ├─ Save to .workflow/task-*.json
     │
     ├─ Spawn agent
     │  ├─ Pass briefing
     │  ├─ Pass execution params
     │  └─ Get session ID
     │
     ├─ Update task.status → "in-progress"
     ├─ Set task.startedAt
     ├─ Save state
     │
     ├─ Track execution
     │  ├─ Monitor checkpoints
     │  ├─ Track milestones
     │  └─ Report progress
     │
     └─ Continue to next task
```

## Briefing Structure

Every briefing contains:

```javascript
{
  // Task Metadata
  taskId: "string",
  title: "string",
  description: "string",
  priority: "high|medium|low",
  category: "design|infrastructure|strategy|research|code_review",
  
  // Assignment
  assignedAgent: {
    id: "string",
    name: "string",
    title: "string",
    specialty: "string",
    model: "string"
  },
  
  // Deliverables (category-specific)
  deliverables: [
    "deliverable 1",
    "deliverable 2",
    "..."
  ],
  
  // Milestones
  milestones: [
    {
      name: "milestone name",
      timeFromStart: 1,  // hours
      description: "what happens here"
    }
  ],
  
  // Timeline
  timeline: {
    start: "ISO date",
    targetEnd: "ISO date",
    estimatedDurationHours: 2
  },
  
  // Context & Dependencies
  context: {
    relatedTasks: [],
    dependencies: [],
    notes: ""
  },
  
  // Execution Parameters
  executionParams: {
    allowSubagents: true,
    maxParallelWork: 2,
    escalationThreshold: "warning",
    reportingFrequency: "hourly"
  },
  
  // Quality Gates
  qualityGates: [
    {
      name: "gate name",
      criteria: "success criteria"
    }
  ]
}
```

## Agent Integration Points

### Agent Spawning

**Current Implementation** (Simulated):
```javascript
const execution = await spawnExecutionAgent(task, briefing);
// Returns:
// {
//   sessionId: "session_task-id_timestamp",
//   agentId: "johnny",
//   startedAt: "ISO date"
// }
```

**Future Implementation** (OpenClaw CLI):
```bash
openclaw spawn-subagent \
  --agent=johnny \
  --briefing='{"taskId":"..."}' \
  --context=/path/to/context.json \
  --session-callback=http://localhost:8000/callback
```

### Session Tracking

**Monitor Progress**:
```bash
openclaw session status {sessionId}
# Returns agent status, current activity, progress %
```

**Collect Results**:
```bash
openclaw session results {sessionId}
# Returns completed deliverables and final result
```

## Category-Specific Details

### Design Tasks

**Deliverables**:
- Figma mockup file
- Design specification
- Interaction patterns
- Component library
- Accessibility checklist

**Milestones** (2h typical):
- 0.5h: Planning & Setup
- 1.0h: Primary Work
- 1.5h: Review & Refinement
- 2.0h: Final Delivery

**Quality Gates**:
- Design completeness
- Accessibility (WCAG AA)
- Specification clarity

### Infrastructure Tasks

**Deliverables**:
- Architecture diagram
- API design spec
- Database schema
- Implementation roadmap
- Risk assessment
- Performance metrics

**Milestones** (3h typical):
- 0.75h: Planning & Architecture
- 1.5h: Primary Design Work
- 2.25h: Review & Refinement
- 3.0h: Final Delivery

**Quality Gates**:
- Technical accuracy
- Security review
- Completeness

### Strategy Tasks

**Deliverables**:
- Strategy analysis
- Positioning recommendations
- Competitive assessment
- Go-to-market plan
- Timeline
- Success metrics

**Milestones** (3h typical):
- 0.75h: Research & Analysis
- 1.5h: Strategic Planning
- 2.25h: Recommendations
- 3.0h: Final Delivery

**Quality Gates**:
- Research quality
- Actionability
- Business alignment

## Performance & Scalability

### Execution Speed

Using **AI Agent Velocity Principle**:
- Design: 1-2 hours
- Infrastructure: 2-4 hours
- Strategy: 2-4 hours
- Research: 1-2 hours
- Code Review: 1-3 hours

5x-10x faster than human timelines.

### Parallelization

- Multiple agents can run simultaneously
- Task executor spawns without waiting
- Progress tracked concurrently
- Results collected asynchronously

### State Management

- All state in JSON files (easy to backup)
- No database required
- Git-compatible for version control
- Easy to parse and query

## Error Handling

### At Briefing Generation
- Task missing required fields
- Invalid category
- Unknown agent ID
- Invalid due date

**Recovery**: Skip task, log error, continue

### At Approval
- User rejects task
- User aborts executor

**Recovery**: Mark as rejected, continue

### At Agent Spawning
- Agent unavailable
- Context too large
- Network error

**Recovery**: Mark as failed, log error, continue

### During Execution
- Agent crashes
- Timeout
- Network interruption

**Recovery**: Record failure, alert user, can retry manually

## Security Considerations

### State File Access
- State files contain task descriptions & assignments
- Not encrypted (can be added if needed)
- Should be restricted to user permissions

### Agent Context
- Briefing passed to agent contains full task details
- Agent can spawn subagents with same context
- Consider sensitive data in task descriptions

### External Integration
- Currently no external API calls
- Future Telegram/Slack integration should use tokens
- Agent spawning will use OpenClaw's auth

## Future Enhancements

### Short-term (Next 2 weeks)
- [ ] Webhook callbacks on task completion
- [ ] Telegram notifications for approvals
- [ ] Email summaries of execution
- [ ] Task priority queue management

### Mid-term (Next month)
- [ ] Real-time WebSocket tracking
- [ ] Task dependency resolution
- [ ] Automatic escalation on timeout
- [ ] Per-agent performance metrics

### Long-term (Next quarter)
- [ ] Dashboard UI for approvals
- [ ] Advanced scheduling & queuing
- [ ] Task batching & grouping
- [ ] Multi-user approval workflows
- [ ] Analytics & reporting

## Development Notes

### Testing

To test the executor without spawning agents:
```javascript
// In task-workflow-executor.js, modify spawnExecutionAgent:
async spawnExecutionAgent(task, briefing) {
  console.log(`[DRY RUN] Would spawn ${briefing.assignedAgent.name}`);
  return { sessionId: `dry_${task.id}`, agentId: task.assignedTo };
}
```

### Local Development

```bash
# Install dependencies (none required, pure Node.js)
# Run with debug output
node --inspect scripts/task-workflow-executor.js
```

### State Inspection

```bash
# Pretty-print state
jq . /Users/timothyryan/.openclaw/workspace/.mission-control-state.json

# Query tasks
jq '.tasks[] | select(.status == "queued")' state.json

# Get statistics
jq '{total: (.tasks | length), queued: (.tasks | map(select(.status == "queued")) | length)}' state.json
```

## Integration Checklist

- [x] Read mission control state
- [x] Parse queued tasks
- [x] Generate briefings
- [x] Interactive approval
- [x] State persistence
- [x] Agent spawning (simulated)
- [ ] Real OpenClaw integration
- [ ] Session tracking
- [ ] Result collection
- [ ] Telegram notifications
- [ ] Performance analytics

---

**Last Updated**: March 18, 2026  
**Version**: 1.0.0  
**Status**: Ready for testing with real agent execution
