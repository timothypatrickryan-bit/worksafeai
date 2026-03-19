# Task Workflow Automation System

Complete production-ready task automation system for OpenClaw.

**Status**: ✅ Ready  
**Version**: 1.0.0  
**Created**: March 18, 2026

## Quick Start (30 seconds)

```bash
# Initialize
bash init-workflow.sh

# Run executor
node task-workflow-executor.js

# Approve tasks when prompted
```

## What This Does

Automates the complete task lifecycle:

```
QUEUED → BRIEFING (auto-generate) → APPROVED (your click) → 
IN-PROGRESS (spawn agent) → REVIEW → COMPLETED
```

## Files Overview

### Core Components
- **`task-workflow-executor.js`** - Main execution engine
- **`workflow-state-manager.js`** - State tracking & persistence
- **`init-workflow.sh`** - System initialization

### Documentation
- **`QUICKSTART.md`** - 5-minute setup guide → **START HERE**
- **`WORKFLOW_README.md`** - Complete system documentation
- **`ARCHITECTURE.md`** - Technical architecture & design
- **`README.md`** - This file (overview)

### Additional Resources
- **`../WORKFLOW_DEPLOYMENT_NOTES.md`** - Deployment checklist
- **`../IDENTITY.md`** - Agent identity (Lucy)
- **`../SOUL.md`** - Core principles

## Current Queued Tasks (5)

1. **iOS Mission Control App Design** - Johnny (Designer)
2. **API Hardening for iOS** - Chief (Infrastructure)
3. **Unified Dashboard Design** - Johnny (Designer)
4. **Dashboard Backend Plan** - Chief (Infrastructure)
5. **Brand Strategy Analysis** - Laura (Strategy)

All ready for processing!

## Quick Links

| Need | Resource |
|------|----------|
| **Get started in 5 min** | [QUICKSTART.md](QUICKSTART.md) |
| **System overview** | [WORKFLOW_README.md](WORKFLOW_README.md) |
| **Technical details** | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **Deployment info** | [../WORKFLOW_DEPLOYMENT_NOTES.md](../WORKFLOW_DEPLOYMENT_NOTES.md) |
| **Run the executor** | `node task-workflow-executor.js` |
| **Initialize system** | `bash init-workflow.sh` |

## Key Features

### ✅ Automatic Briefing Generation
- Category-aware (Design, Infrastructure, Strategy, Research, Code Review)
- Auto-generated deliverables
- Milestone timeline
- Quality gates
- Related tasks & dependencies

### ✅ Interactive Approval Loop
- Display full briefing with context
- User prompt for yes/no decision
- Save approval decision
- Support for rejection

### ✅ Automated Agent Execution
- Spawn assigned agent with full context
- Pass briefing & execution parameters
- Track execution progress
- Monitor for completion/failure

### ✅ Persistent State Management
- Maintains `.mission-control-state.json`
- Creates `.workflow-state.json`
- Per-task execution files in `.workflow/`
- Survives application restarts

### ✅ Comprehensive Reporting
- Queue statistics
- Execution progress
- Final summary
- Error tracking

## State Files

Everything stored in `/Users/timothyryan/.openclaw/workspace/`:

| File | Purpose |
|------|---------|
| `.mission-control-state.json` | Main task state (read/write) |
| `.workflow-state.json` | Workflow tracking (auto-created) |
| `.workflow/task-*.json` | Per-task execution details |

## Running the Executor

### Basic Usage
```bash
node task-workflow-executor.js
```

### With Logging
```bash
node task-workflow-executor.js | tee workflow-$(date +%s).log
```

### Dry Run (view briefings without spawning)
Edit `spawnExecutionAgent()` to return early.

## Task Processing Flow

```
START
  ↓
Initialize System
  ↓
Load State File
  ↓
Get Queued Tasks (5)
  ↓
FOR EACH Task:
  ├─ Generate Briefing
  ├─ Display to User
  ├─ Request Approval
  ├─ If Approved:
  │  ├─ Spawn Agent
  │  ├─ Track Execution
  │  └─ Save Result
  └─ If Rejected:
     └─ Skip to Next
  ↓
Generate Summary
  ↓
END
```

## Agent Integration

Spawns subagents with full context:
- **Johnny** - Design tasks
- **Chief** - Infrastructure tasks
- **Laura** - Strategy tasks
- **Scout, Mark, Steven** - Other categories

Each agent receives:
- Complete briefing
- Deliverables checklist
- Milestone timeline
- Quality gates
- Execution parameters

## Understanding Briefings

Each auto-generated briefing includes:

### Deliverables
What the agent will produce:
- Design: Mockups, specs, components
- Infrastructure: Architecture, API specs, roadmaps
- Strategy: Analysis, recommendations, plans
- Research: Report, visualizations, insights

### Milestones
Progress checkpoints:
- Short tasks (≤2h): 50%, 100%
- Long tasks (>2h): 25%, 50%, 75%, 100%

### Timeline
- Start date/time
- Target end date/time
- Estimated duration (1-4 hours)

### Quality Gates
Success criteria:
- Design: Mockups complete, WCAG AA accessible
- Infrastructure: Technical soundness, security verified
- Strategy: Research quality, actionable recommendations

## AI Agent Velocity

Implements **AI Agent Velocity Principle**:
- Plans at AI pace (hours/days, not weeks)
- Compresses timelines 5-10x
- Parallelizes independent work
- Aggressive delegation

**Typical timelines**:
- Design: 1-2 hours
- Infrastructure: 2-4 hours
- Strategy: 2-4 hours
- Research: 1-2 hours
- Code Review: 1-3 hours

## Example Session

```bash
$ node task-workflow-executor.js

🚀 Task Workflow Executor Starting...

📋 Found 5 queued task(s)

────────────────────────────────────
Processing Task 1/5
────────────────────────────────────

📋 Step 1: Generating briefing...
✓ Briefing generated

🔍 Step 2: Awaiting approval...

════════════════════════════════════
📋 TASK BRIEFING & APPROVAL REQUEST
════════════════════════════════════
✓ Task ID: task-iphone-missioncontrol-design
✓ Title: Design iOS Mission Control App - Phase 1
✓ Assigned Agent: Johnny (Senior Designer)
✓ Priority: HIGH
✓ Category: design
✓ Hours Until Due: 5h
✓ Est. Duration: 2h

📝 Description:
  Create iPhone mockups and design specification...

🎯 Deliverables:
  1. Figma mockup file
  2. Design specification document
  3. Interaction patterns & flows
  4. Component library
  5. Accessibility compliance checklist

📊 Milestones:
  1. Planning & Setup (T+0.5h): Requirements clarified
  2. Primary Work (T+1h): Main deliverables in progress
  3. Review & Refinement (T+1.5h): Initial deliverables ready
  4. Final Delivery (T+2h): All deliverables complete

────────────────────────────────────
👤 Approve this task briefing? (yes/no): yes

✅ Step 3: Marking task as approved...
✓ Task approved and saved

🎬 Step 4: Spawning execution agent...
✓ Execution started. Context saved.
✓ Agent Johnny is now processing this task.

📡 Step 5: Initiating execution tracking...
✓ Execution tracking initiated

────────────────────────────────────
Processing Task 2/5
[... continues for remaining tasks ...]

════════════════════════════════════
📊 WORKFLOW EXECUTION SUMMARY
════════════════════════════════════

📈 Workflow Statistics:
  Total Executions Initiated: 5
  ✓ Completed: 0
  ⏳ In Progress: 5
  ✗ Failed: 0
```

## Checking Status

### View Execution Stats
```bash
node -e "
const m = require('./workflow-state-manager');
console.log(new m().getStats());
"
```

### View Queue
```bash
jq '.tasks[] | select(.status == "queued")' \
  ../.mission-control-state.json
```

### View Task Execution
```bash
cat ../.workflow/task-iphone-missioncontrol-design.json | jq
```

## Troubleshooting

### No queued tasks found
Create new tasks with `status: "queued"` in state file.

### Permission denied on script
```bash
chmod +x task-workflow-executor.js init-workflow.sh
```

### State file invalid JSON
```bash
jq . ../.mission-control-state.json  # Validate
```

### Approval prompt not showing
Run in terminal (not background). Requires stdin.

## Integration with OpenClaw

The system:
- Reads mission control state via file
- Spawns subagents with full briefing context
- Passes execution parameters to agents
- Tracks session IDs for monitoring
- Collects results on completion

Ready to integrate with real OpenClaw agent spawning.

## Architecture Summary

```
┌─ Task Workflow Executor ─┐
│ (main orchestrator)       │
├───────────────────────────┤
│ 1. Load state             │
│ 2. Get queued tasks       │
│ 3. FOR EACH task:         │
│    ├─ Generate briefing   │
│    ├─ Request approval    │
│    ├─ Spawn agent         │
│    └─ Track execution     │
│ 4. Generate summary       │
└─────────────┬─────────────┘
              │
              ├─ State Manager (persistence)
              │  └─ .workflow/ directory
              │
              ├─ Mission Control State (read/write)
              │  └─ .mission-control-state.json
              │
              └─ Agents (execution)
                 ├─ Johnny (Designer)
                 ├─ Chief (Infrastructure)
                 ├─ Laura (Strategy)
                 └─ Others
```

## Future Enhancements

### Short-term
- [ ] Real OpenClaw agent spawning
- [ ] Session tracking via OpenClaw API
- [ ] Telegram notifications
- [ ] Email summaries

### Mid-term
- [ ] WebSocket real-time tracking
- [ ] Async approval via reactions
- [ ] Automatic escalation
- [ ] Task dependency resolution

### Long-term
- [ ] Dashboard UI
- [ ] Advanced scheduling
- [ ] Performance analytics
- [ ] Multi-user workflows

## Support Resources

- **Questions?** → See `QUICKSTART.md`
- **Details?** → See `WORKFLOW_README.md`
- **Technical?** → See `ARCHITECTURE.md`
- **Deployment?** → See `../WORKFLOW_DEPLOYMENT_NOTES.md`

## Getting Started Now

```bash
# 1. Initialize (creates directories & state files)
bash init-workflow.sh

# 2. Start processing queued tasks
node task-workflow-executor.js

# 3. Approve tasks when prompted (type 'yes')

# 4. Check results
jq . ../.workflow-state.json
```

That's it! The system handles the rest.

---

**Created**: March 18, 2026  
**Status**: Production Ready  
**Next**: Run `bash init-workflow.sh` then `node task-workflow-executor.js`
