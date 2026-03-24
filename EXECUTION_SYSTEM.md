# Autonomous Execution System — Complete Architecture

## Overview

The mission control system is now **fully autonomous**. Work flows from conception → queue → execution → completion without manual intervention.

```
┌─────────────────┐
│  New Project    │
│  Created        │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  PROJECT DECOMPOSITION (Autonomy)   │
│  - Creates phases                   │
│  - Creates tasks                    │
│  - Assigns agents                   │
└────────┬────────────────────────────┘
         │
         ▼ (queued)
┌─────────────────────────────────────┐
│  AGENT SPAWNER (Every 2 minutes)    │
│  - Finds queued + assigned tasks    │
│  - Spawns agents                    │
│  - Marks as "executing"             │
└────────┬────────────────────────────┘
         │
         ▼ (executing)
┌─────────────────────────────────────┐
│  AGENT EXECUTION                    │
│  - Scout: Research                  │
│  - Steven: Writing                  │
│  - Lucy: Automation                 │
│  - Others: Specialized work         │
└────────┬────────────────────────────┘
         │
         ▼ (completed)
┌─────────────────────────────────────┐
│  NEXT TASK (Automatic Loop)         │
│  - Mark completed                   │
│  - Spawn next queued task           │
│  - Progress updates                 │
└─────────────────────────────────────┘
```

---

## Core Components

### 1. **Autonomy Loop** (`autonomy-heartbeat.js`)

**Frequency:** Every 30 minutes  
**Role:** Monitoring & Analysis  
**What it does:**
- Detects new/active projects
- Reviews executing task progress
- Monitors for stuck tasks (>4h)
- Logs health metrics
- Identifies gap remediation needs

**NOT for execution** — just awareness

**Output:** `.autonomy-log.txt` (audit trail)

### 2. **Agent Spawner** (`agent-spawner.js`)

**Frequency:** Every 2 minutes  
**Role:** Task Execution  
**What it does:**
- Reads queued tasks
- Checks for assigned agents
- Spawns agents via sessions_spawn
- Updates task status
- Records spawn events

**This drives all work** — core execution engine

**Output:** `.agent-spawns.json` (spawn records)

### 3. **Mission Control** (Next.js app on 3000/3001)

**Frequency:** Real-time via WebSocket  
**Role:** Visibility & Control  
**What it does:**
- Displays projects, tasks, agents
- Shows progress updates
- Allows manual approvals
- Provides briefing interface
- Real-time state dashboard

**For Tim's visibility** — know what's happening

**Output:** Web UI at http://localhost:3000 (dev) or 3001 (prod)

---

## Task States & Transitions

```
CREATED (initial)
    ↓
QUEUED (ready for execution, waiting for agent spawn)
    ├─→ BRIEFING (pending approval)
    │   ├─→ APPROVED → QUEUED
    │   └─→ REJECTED → QUEUED (with feedback)
    │
    ├─→ EXECUTING (agent is working)
    │   └─→ COMPLETED (done, next task spawns)
    │
    └─→ ERROR (invalid, stuck, or failed)
        └─→ STALLED (>4h with no progress)
```

---

## Agent Registry

Registered agents and their specialties:

| Agent | Model | Specialties |
|-------|-------|-------------|
| **Scout** | Haiku | research, analysis, data |
| **Steven** | Haiku | writing, content, editing |
| **Lucy** | Haiku | automation, infrastructure, systems |
| **Johnny** | Haiku | design, UI/UX, frontend |
| **Chief** | Haiku | infrastructure, backend, security |
| **Velma** | Sonnet | quality assurance, complex analysis |

---

## Task Execution Flow

### Example: "Research Framework Setup" Task

**1. CREATED**
```json
{
  "id": "task-dcwu-2-research-framework",
  "title": "Research Framework Setup",
  "status": "created",
  "assignedTo": "Scout",
  "briefing": {
    "objective": "Build research methodology...",
    "executionPlan": {
      "deliverables": ["Source list", "Methodology", "Metrics"]
    }
  }
}
```

**2. QUEUED** (Autonomy processes project → creates tasks)
```
Status: queued
AssignedTo: Scout
Action: Waiting for spawner
```

**3. SPAWNED** (Agent Spawner detects & spawns)
```
Status: executing (15% progress)
SpawnRecord: { taskId, agentId: "scout", sessionKey, spawnedAt }
Log: "🚀 Scout starting: Research Framework Setup"
```

**4. EXECUTION** (Scout works on task)
```
Status: executing (progress: 25% → 50% → 75% → 90%)
Log entries show progress: "Analyzing sources", "Building methodology", etc.
```

**5. COMPLETED** (Agent finishes, updates state)
```
Status: completed (100%)
Output: { type, deliverables, confidence }
NextTask: Agent Spawner queues next task automatically
```

---

## Automation Stack

### Layer 1: launchd Jobs (macOS)
```
com.openclaw.autonomy-loop → autonomy-heartbeat.js (30 min)
com.openclaw.heartbeat-mission-control → heartbeat-mission-control.js (60 min)
```

### Layer 2: Long-Running Daemons
```
agent-spawner.js → Runs continuously, checks every 2 min
mission-control app → Node.js server on port 3000/3001
```

### Layer 3: Event Listeners
```
.autonomy-log.txt → Audit trail
.agent-spawns.json → Spawn records
.mission-control-state.json → Source of truth
```

---

## State Management

**Single source of truth:** `.mission-control-state.json`

```json
{
  "projects": [
    {
      "id": "project-xyz",
      "name": "Project Name",
      "status": "active",
      "orchestratorPlan": {
        "objective": "...",
        "phases": [...],
        "timeline": "...",
        "metrics": [...]
      }
    }
  ],
  "tasks": [
    {
      "id": "task-xyz",
      "title": "Task Title",
      "projectId": "project-xyz",
      "status": "executing",
      "assignedTo": "Scout",
      "progress": 50,
      "briefing": { ... },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "agents": [
    {
      "id": "scout",
      "status": "working",
      "currentTask": "task-xyz",
      "progress": 50
    }
  ]
}
```

---

## Monitoring & Health Checks

### Daily Health Review
```bash
# Check autonomy loop
tail -f .autonomy-log.txt | grep "SUMMARY"

# Check agent spawns
tail -f .agent-spawner.log | grep "spawned\|executed"

# Check stuck tasks
cat .mission-control-state.json | jq '.tasks[] | select(.status == "executing" and (.createdAt < now - 4h))'

# Check project progress
cat .mission-control-state.json | jq '.projects[] | {name, progress: (.orchestratorPlan.progress)}'
```

### Expected Healthy State
- ✅ Autonomy loop runs every 30 min (launchctl list shows it)
- ✅ Agent spawner running (ps aux | grep agent-spawner)
- ✅ No tasks stuck > 4 hours
- ✅ New tasks spawn within 2 minutes of queuing
- ✅ Completed tasks move next queued task to executing

### Issues & Recovery

**Agent stuck in "executing" > 4 hours**
```bash
# Check autonomy log for alerts
grep "STUCK\|STALLED" .autonomy-log.txt

# Manual intervention
cat .mission-control-state.json | jq '.tasks[] | select(.status == "executing" and createdAt < (now - 14400))'
# Change status to "error" and respawn
```

**Spawner not running**
```bash
# Restart it
node scripts/agent-spawner.js &

# Or add to launchd for permanent automation
```

---

## Common Workflows

### Running the System

**1. Start Mission Control (for visibility)**
```bash
./scripts/mission-control.sh dev start
# View at http://localhost:3000
```

**2. Verify Spawner is Running**
```bash
ps aux | grep agent-spawner
# If not running: node scripts/agent-spawner.js > .agent-spawner.log 2>&1 &
```

**3. Create a Project**
- Go to Mission Control dashboard
- Click "Create Project"
- Fill in details, submit
- Autonomy loop will detect it, create tasks, queue them

**4. Watch Execution**
- Agent spawner detects queued tasks
- Spawns agents
- Monitor progress on dashboard in real-time

### Making Code Changes

**To fix bugs or add features:**
```bash
1. Make changes to /apps/mission-control/src/
2. npm run dev       # Dev server rebuilds from source
3. Test at :3000
4. ./scripts/mission-control.sh prod rebuild  # Deploy to production
5. Verify at :3001
```

### Debugging Tasks

**Why didn't my task spawn?**
```bash
# Check if assigned to valid agent
cat .mission-control-state.json | jq '.tasks[] | select(.status == "queued") | {title, assignedTo}'

# Check spawn logs
tail .agent-spawner.log | grep "task-id-here"

# Valid agents: scout, steven, lucy, johnny, chief, velma
```

---

## Performance & Optimization

**Current Throughput:**
- ~3 agents spawning per spawner cycle (2 min interval)
- ~1-2 tasks completing per agent per hour (varies by complexity)
- ~60-70 total tasks per project (tracked in state)

**Optimization Opportunities:**
- Parallel spawning (spawn multiple agents simultaneously)
- Smarter queuing (priority-based, dependency-aware)
- Agent specialization routing (match task type to agent strength)
- Result caching (avoid re-research/re-write)

---

## Dependencies & Requirements

**System:**
- Node.js 18+ (for agent spawner)
- macOS launchd (for scheduled jobs)
- OpenClaw with sessions_spawn (for agent execution)

**NPM Packages:**
- express, next, react, zod, postgres-js

**User Requirements:**
- Assigned agents must be in AGENT_REGISTRY
- Tasks must have a valid briefing object
- Projects need orchestrator plan before tasks spawn

---

## Future Enhancements

- [ ] Automatic agent assignment based on task type
- [ ] Dependency tracking (task A before task B)
- [ ] Performance metrics per agent
- [ ] Cost tracking (tokens used per task)
- [ ] A/B testing agent effectiveness
- [ ] Auto-retry failed tasks
- [ ] Parallel execution strategies
- [ ] Human-in-the-loop approvals
- [ ] Real-time Slack/Email notifications
- [ ] Task history & analytics

---

**Last Updated:** March 22, 2026 @ 4:30 PM EST  
**Status:** ✅ Production Ready  
**Next Review:** March 24, 2026
