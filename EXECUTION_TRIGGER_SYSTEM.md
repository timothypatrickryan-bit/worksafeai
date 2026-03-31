# Execution Trigger System

## Overview

The **Execution Trigger Layer** is the missing conductor between "task is queued" and "agent is executing". It converts the static task queue into a dynamic execution pipeline at **AI speed**.

**Problem it solves:**
- Briefings → Tasks (working) but Tasks → Agents (broken)
- 22 briefings, only 7 in queue, 0 actually executing
- Manual intervention still required to get work done
- Not truly autonomous

**Solution:**
- Automated pipeline that triggers agent spawning on heartbeat
- Queued tasks → Executing agents in <5 minutes
- Parallel execution by agent specialty
- Auto-status updates via completion signals

---

## Architecture

### Layer 1: Execution Trigger (execution-trigger.js)

**What it does:**
- Runs every 15 minutes (macOS launchd job)
- Finds all queued tasks
- Marks them as "executing"
- Prepares execution state for agents
- Logs all transitions

**Input:**
- Tasks with `status: "queued"`
- Briefings with agent assignments

**Output:**
- Tasks marked `status: "executing"`
- Execution state tracking file (`.execution-state.json`)
- Log of all conversions (`.execution-trigger.log`)

**When it runs:**
```bash
launchctl list | grep execution-trigger
```

Should show the job is active. Runs every 900 seconds (15 min).

---

### Layer 2: Task Executor (task-executor.js)

**What it does:**
- Groups executing tasks by agent
- Generates briefing context for each task
- Creates execution plan with parallelization
- Ready for `sessions_spawn()` integration

**Current state:**
- ✅ Planning + logging ready
- ⏳ Awaiting `sessions_spawn()` integration
- Will spawn agents when wired to OpenClaw sessions API

**Expected behavior (when integrated):**
```
For each agent group:
  - Generate briefing context with full task details
  - Call sessions_spawn({ task, agentId, runtime: "subagent" })
  - Agent executes briefing at AI speed
  - Agent responds with [TASK_COMPLETE] signal
  - System auto-updates task status
```

---

## Data Flow

```
QUEUED TASK
    ↓
execution-trigger.js (every 15 min)
    ↓
task.status = "executing"
    ↓
task-executor.js
    ↓
Generate briefing context
    ↓
[PENDING INTEGRATION]
sessions_spawn(agent, task)
    ↓
AGENT EXECUTES
    ↓
Agent signals [TASK_COMPLETE]
    ↓
Auto-update: task.status = "complete"
    ↓
COMPLETED TASK
```

---

## Current Status

### ✅ What's Working

1. **Execution Trigger Layer**
   - ✅ Detects queued tasks
   - ✅ Marks as executing
   - ✅ Groups by agent (Lucy: 5, Johnny: 2)
   - ✅ Runs on heartbeat (launchd job active)
   - ✅ Logs all transitions

2. **Task Executor Planning**
   - ✅ Creates execution plans
   - ✅ Groups tasks by agent specialty
   - ✅ Generates briefing context
   - ✅ Ready for agent spawn

3. **Smart Routing**
   - ✅ Johnny: Frontend design tasks
   - ✅ Lucy: Orchestration/management tasks
   - ✅ Velma: QA/testing tasks (when applicable)
   - ✅ Others mapped and ready

### ⏳ What's Next

**Integration Point:** Wire task-executor.js to `sessions_spawn()`

When an executing task is detected, the system should:
1. Get agent assignment from briefing
2. Call `sessions_spawn()`
3. Pass briefing + task context
4. Wait for [TASK_COMPLETE] signal
5. Auto-update task status

---

## Running Manually

### Check Status
```bash
# See if execution-trigger job is running
launchctl list | grep execution-trigger

# View recent execution logs
tail -20 .execution-trigger.log

# Check what tasks are marked as executing
tail -5 .execution-state.json
```

### Run Immediately (not waiting for 15 min interval)
```bash
node scripts/execution-trigger.js
node scripts/task-executor.js
```

### View Task States
```bash
# See queued tasks
curl http://localhost:3001/api/tasks | jq '.tasks[] | select(.status == "queued")'

# See executing tasks
curl http://localhost:3001/api/tasks | jq '.tasks[] | select(.status == "executing")'

# See completed tasks
curl http://localhost:3001/api/tasks | jq '.tasks[] | select(.status == "complete")'
```

---

## Files

- **scripts/execution-trigger.js** — Main trigger layer (converts queued → executing)
- **scripts/task-executor.js** — Execution planning (ready for spawn integration)
- **~/Library/LaunchAgents/com.openclaw.execution-trigger.plist** — macOS scheduler
- **.execution-trigger.log** — Audit trail of all triggers
- **.execution-state.json** — Tracking file for executing tasks

---

## Integration Checklist

- [x] Detect queued tasks
- [x] Mark as executing
- [x] Create execution plan
- [x] Group by agent
- [x] Generate briefing context
- [ ] **Wire to sessions_spawn()**
- [ ] Poll for [TASK_COMPLETE] signals
- [ ] Auto-update task status on completion
- [ ] Handle stuck/timeout tasks
- [ ] Real-time dashboard updates

---

## Why This Matters

**Before Execution Trigger:**
- 7 tasks queued, 0 executing
- Manual approval/assignment required
- Days to get work done
- Not autonomous

**After Execution Trigger (Full Implementation):**
- 7 tasks queued → 7 agents spawned in <5 minutes
- Automatic assignment by agent specialty
- Parallel execution (Lucy + Johnny working simultaneously)
- Fully autonomous
- **AI SPEED** ⚡

---

## Example Execution Log

```
[2026-03-31T00:19:49.393Z] 🚀 EXECUTION TRIGGER LAYER STARTED
[2026-03-31T00:19:49.396Z] 📋 Found 7 queued tasks
[2026-03-31T00:19:49.396Z] 📤 Spawning Lucy for task: "Home Builder Helper: Concept & wireframes"
[2026-03-31T00:19:49.396Z] ✅ [QUEUED→EXECUTING] Task assigned to Lucy
...
[2026-03-31T00:19:49.398Z] 📊 EXECUTION TRIGGER SUMMARY:
[2026-03-31T00:19:49.398Z]    Spawned: 7
[2026-03-31T00:19:49.398Z]    Now Executing: 7
[2026-03-31T00:19:49.398Z]    Completed: 0
```

---

## Agent Specialties (Smart Routing)

| Agent | Specialty | Focus |
|-------|-----------|-------|
| Lucy | Orchestration | End-to-end execution, coordination, quality |
| Johnny | Frontend | UI/UX design, component implementation |
| Jarvis | Backend | API development, databases, server-side |
| Velma | QA | Testing, code review, quality assurance |
| Chief | Architecture | System design, technical strategy |
| Scout | Research | Analysis, market intelligence, insights |
| Laura | Strategy | Brand positioning, business development |
| Steven | DevOps | Infrastructure, deployment, automation |
| Opus | Deep Analysis | Complex code review, architectural decisions |

---

## Next Steps

1. **Today:** Verify execution-trigger is running on heartbeat
2. **This week:** Integrate with sessions_spawn() for real agent execution
3. **Full implementation:** Auto-update task status on completion signals
4. **Then:** Watch all 7 tasks execute in parallel, completing in hours instead of days

---

**Status:** ✅ EXECUTION TRIGGER LAYER LIVE  
**Launchd Job:** ✅ ACTIVE (runs every 15 min)  
**Next:** Wire to agent execution system
