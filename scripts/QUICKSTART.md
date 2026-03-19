# Task Workflow Automation - Quick Start Guide

Get up and running with the task workflow executor in 5 minutes.

## What Is This?

A complete task automation system that:
1. **Reads** queued tasks from your mission control state
2. **Generates** comprehensive briefings (deliverables, milestones, timeline)
3. **Waits** for your approval (interactive prompt)
4. **Spawns** the assigned agent with full context
5. **Tracks** execution progress
6. **Reports** results

## Installation (2 minutes)

### 1. Initialize the System
```bash
bash /Users/timothyryan/.openclaw/workspace/scripts/init-workflow.sh
```

This creates:
- `.workflow/` directory for tracking
- `.workflow-state.json` for persistent state

### 2. Verify Files
```bash
ls -la /Users/timothyryan/.openclaw/workspace/scripts/
```

You should see:
- `task-workflow-executor.js` ✓
- `workflow-state-manager.js` ✓
- `WORKFLOW_README.md` ✓
- `QUICKSTART.md` ✓

## Running the Executor (1 minute)

### Start Processing Queued Tasks
```bash
node /Users/timothyryan/.openclaw/workspace/scripts/task-workflow-executor.js
```

The executor will:
1. Load all queued tasks from `.mission-control-state.json`
2. For each task:
   - Generate a briefing
   - Display it with all context
   - Ask for approval
   - Spawn the agent if approved
   - Track execution
3. Generate a final summary report

### What Happens Next

For each task, you'll see:

```
════════════════════════════════════════════════════════════════════════════════
📋 TASK BRIEFING & APPROVAL REQUEST
════════════════════════════════════════════════════════════════════════════════

✓ Task ID: task-123
✓ Title: Design iOS App
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
  ...

📊 Milestones:
  1. Planning & Setup (T+0.5h): Requirements clarified
  2. Primary Work (T+1h): Main deliverables in progress
  3. Review & Refinement (T+1.5h): Initial deliverables ready
  4. Final Delivery (T+2h): All deliverables complete

────────────────────────────────────────────────────────────────────────────────
👤 Approve this task briefing? (yes/no):
```

**Type `yes` or `no` and press Enter.**

## Current Queued Tasks (5 Total)

### 1. 🎨 iOS Mission Control App Design
- **Agent**: Johnny (Designer)
- **Due**: March 19, 2026
- **Duration**: ~2 hours
- **Status**: Queued

### 2. 🔐 API Hardening for iOS
- **Agent**: Chief (Infrastructure)
- **Due**: March 19, 2026
- **Duration**: ~3 hours
- **Status**: Queued

### 3. 📊 Unified Dashboard Design
- **Agent**: Johnny (Designer)
- **Due**: March 18, 2026 (Soon!)
- **Duration**: ~2 hours
- **Status**: Queued

### 4. 🏗️ Dashboard Backend Plan
- **Agent**: Chief (Infrastructure)
- **Due**: March 18, 2026 (Soon!)
- **Duration**: ~3 hours
- **Status**: Queued

### 5. 📈 Brand Strategy Analysis
- **Agent**: Laura (Strategy)
- **Due**: March 19, 2026
- **Duration**: ~2 hours
- **Status**: Queued

## Understanding Briefings

Each briefing includes:

### Deliverables
What the agent will produce. Examples:
- **Design tasks**: Figma mockups, design specs, components
- **Infrastructure**: Architecture docs, API specs, roadmaps
- **Strategy**: Analysis, recommendations, implementation plan
- **Research**: Report, visualizations, insights

### Milestones
Key checkpoints during execution:
- **25%**: Planning phase complete
- **50%**: Primary work halfway done
- **75%**: Initial deliverables ready for feedback
- **100%**: All work complete

### Timeline
- **Start**: When execution begins
- **Target End**: When it should be done
- **Est. Duration**: How long it should take (usually 1-4 hours)

### Quality Gates
Success criteria for the work:
- Design tasks: Mockups complete, WCAG AA accessible
- Infrastructure: Technical soundness, security verified
- Strategy: Research quality, actionable recommendations

## The Approval Loop

When you see the approval prompt:

```
👤 Approve this task briefing? (yes/no):
```

**Type `yes`** if:
- The briefing makes sense
- The deliverables are what you want
- The timeline is acceptable
- The assigned agent is appropriate

**Type `no`** if:
- The scope needs adjustment
- The deliverables are off
- The timeline is too tight
- You want to re-route to a different agent

If you reject, the task stays queued and you can approve it manually later.

## What Happens After Approval

1. **Task status** changes to `approved`
2. **Agent is spawned** with the full briefing as context
3. **Execution begins** immediately
4. **Progress is tracked** via checkpoints and milestones
5. **Results are saved** when complete

The executor continues to the next queued task while agents work in parallel.

## State Files

All state is stored in `/Users/timothyryan/.openclaw/workspace/`:

| File | Purpose |
|------|---------|
| `.mission-control-state.json` | Main state (tasks, agents, contacts) |
| `.workflow-state.json` | Workflow tracking (executions, stats) |
| `.workflow/task-*.json` | Individual task execution details |

## Example Session

```bash
$ node scripts/task-workflow-executor.js

🚀 Task Workflow Executor Starting...

📋 Found 5 queued task(s)

─────────────────────────────────────────────────────────────────────────────
Processing Task 1/5
─────────────────────────────────────────────────────────────────────────────

📋 Step 1: Generating briefing...
✓ Briefing generated

🔍 Step 2: Awaiting approval...

════════════════════════════════════════════════════════════════════════════════
📋 TASK BRIEFING & APPROVAL REQUEST
════════════════════════════════════════════════════════════════════════════════
✓ Task ID: task-iphone-missioncontrol-design
✓ Title: Design iOS Mission Control App - Phase 1
✓ Assigned Agent: Johnny (Senior Designer)
...
👤 Approve this task briefing? (yes/no): yes

✅ Step 3: Marking task as approved...
✓ Task approved and saved

🎬 Step 4: Spawning execution agent...
✓ Execution started. Context saved.
✓ Agent Johnny is now processing this task.
✓ Expected completion: March 19, 2026

📡 Step 5: Initiating execution tracking...
  Progress: 10% (1/10 checks)
  ...
  Progress: 100% (10/10 checks)
✓ Execution tracking initiated

─────────────────────────────────────────────────────────────────────────────
Processing Task 2/5
─────────────────────────────────────────────────────────────────────────────
...

════════════════════════════════════════════════════════════════════════════════
📊 WORKFLOW EXECUTION SUMMARY
════════════════════════════════════════════════════════════════════════════════

📋 Queue Status:
  Total Queued Tasks: 0

📈 Workflow Statistics:
  Total Executions Initiated: 5
  ✓ Completed: 0
  ⏳ In Progress: 5
  ✗ Failed: 0

💾 State Files:
  Main State: /Users/timothyryan/.openclaw/workspace/.mission-control-state.json
  Workflow State: /Users/timothyryan/.openclaw/workspace/.workflow-state.json
```

## Checking Status Later

### View Execution Stats
```bash
node -e "
const m = require('./workflow-state-manager');
const mgr = new m();
console.log(mgr.getStats());
"
```

Output:
```
{ total: 5, completed: 2, inProgress: 3, failed: 0, pending: 0 }
```

### View Individual Task Status
```bash
cat /Users/timothyryan/.openclaw/workspace/.workflow/task-iphone-missioncontrol-design.json
```

### Check Main State
```bash
cat /Users/timothyryan/.openclaw/workspace/.mission-control-state.json | jq '.tasks[] | select(.status == "in-progress")'
```

## Troubleshooting

### No queued tasks found
```
✓ No queued tasks found.
```
**Reason**: All tasks are either completed, approved, or in progress.

**Fix**: Create new tasks or check status of existing ones.

### Error loading state
```
Error loading state: ENOENT: no such file or directory
```
**Reason**: Mission control state file doesn't exist yet.

**Fix**: Run initialization first:
```bash
bash init-workflow.sh
```

### Agent not spawned
```
Error processing task: Cannot spawn agent
```
**Reason**: Agent might be offline or context couldn't be passed.

**Fix**: Check agent availability and try again.

## Pro Tips

### 1. Batch Approvals
Run the executor once and approve multiple tasks in sequence. They'll all spawn and run in parallel.

### 2. Auto-Reject
If you want to skip certain tasks, type `no` when prompted. They'll stay queued.

### 3. Monitor in Background
```bash
node scripts/task-workflow-executor.js > workflow.log 2>&1 &
tail -f workflow.log
```

### 4. Scheduled Runs
Add to cron for periodic execution:
```bash
# Run every 2 hours
0 */2 * * * cd /Users/timothyryan/.openclaw/workspace && node scripts/task-workflow-executor.js
```

### 5. Integration with Telegram
The executor can post updates to Telegram when integrated (future enhancement).

## Next Steps

1. ✅ **Initialize**: Run `init-workflow.sh`
2. ✅ **Start**: Run `task-workflow-executor.js`
3. ✅ **Approve**: Review and approve tasks
4. ✅ **Monitor**: Check progress via state files
5. ✅ **Review**: Examine results in `.workflow/task-*.json`

## Getting Help

- **Detailed Docs**: See `WORKFLOW_README.md`
- **State Management**: See `workflow-state-manager.js`
- **Source Code**: See `task-workflow-executor.js`
- **Log Files**: Check `.workflow-state.json`

---

**Ready?** Run this to start:

```bash
node /Users/timothyryan/.openclaw/workspace/scripts/task-workflow-executor.js
```

Good luck! 🚀
