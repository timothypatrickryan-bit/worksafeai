# Project Detection & Execution Workflow

**Purpose:** Ensure every project Tim creates gets immediately analyzed, planned, and executed. No projects fall through the cracks.

---

## 🚨 CRITICAL: Project Detection (Every Heartbeat)

**When:** Every heartbeat check (already running every 30-60 min)
**What:** Scan for NEW or ACTIVE projects

```bash
# Check for projects with status !== "completed"
cat .mission-control-state.json | jq '.projects[] | select(.status != "completed")'
```

**If new/active project found:**
1. ✅ Extract project details
2. ✅ Check if `orchestratorPlan` is empty/incomplete
3. ✅ If empty → **IMMEDIATE ACTION**: Run full decomposition
4. ✅ If complete → Check task progress, escalate blockers

---

## 📋 Project Decomposition (Immediate - < 30 min)

**For each active project:**

### Step 1: Parse Statement of Work
- Read project description
- Extract objectives, success criteria, timeline constraints
- Identify dependencies/blockers

### Step 2: Break Down into Work Packages
- Identify major phases/milestones
- Define concrete deliverables for each phase
- Estimate effort (hours/days)
- Identify critical path items

### Step 3: Create Execution Plan
- Phase 1: What gets built first?
- Phase 2: What comes next?
- Phase 3+: Remaining work
- Timeline: Days/weeks to completion
- Success metrics: How do we know it's done?

### Step 4: Create Task Briefing
- Generate 3-5 discrete tasks from the plan
- Assign priority (critical/high/medium)
- Identify best agent/skill match
- Add to Mission Control task queue

### Step 5: Brief Tim
- Email/message with:
  - Project summary
  - Decomposition breakdown
  - Execution plan (phases + timeline)
  - First task already queued and ready
  - Next actions

---

## 🚨 CRITICAL: Pre-Action Checks (Before Step 1)

**BEFORE starting decomposition, ALWAYS check:**

1. **Active subagents list** - Is decomposition already running?
   ```bash
   subagents(action=list) | grep project_id
   ```
   If yes → ABORT, let existing agent finish

2. **Mission Control state** - Are tasks already queued?
   ```bash
   cat .mission-control-state.json | jq '.tasks[] | select(.projectId == "'$ID'")'
   ```
   If taskCount > 0 → ABORT, project already decomposed

3. **Autonomy log** - Recent activity on this project?
   ```bash
   grep "$PROJECT_ID" .autonomy-log.txt | tail -5
   ```
   If activity < 30 min ago → ABORT, work in progress

**Only proceed if ALL three checks pass.**

See: PRE_ACTION_CHECKLIST.md

---

## 📊 Project Status Tracking

**Ongoing (every heartbeat):**

1. **Check project progress**
   ```bash
   cat .mission-control-state.json | jq '.projects[] | select(.status == "active")'
   ```

2. **Monitor tasks**
   - Are tasks being completed?
   - Any blockers/stuck tasks?
   - Progress vs. plan on track?

3. **Update state**
   - Move completed tasks to done
   - Escalate any issues
   - Update progress percentage

4. **Auto-promote completion**
   - When all tasks done → Mark project complete
   - Log completion to memory

---

## 🔄 Workflow Integration

**Add to HEARTBEAT.md autonomy loop:**

```
Every 30 minutes:
  1. Check for NEW or ACTIVE projects (status != "completed")
  2. For each active project:
     - If orchestratorPlan is empty → Run decomposition NOW
     - If orchestratorPlan exists → Check task progress
     - If blocked → Escalate
  3. Create/queue tasks as needed
  4. Log all findings to autonomy log
```

**Template for memory log:**
```markdown
## Project: [Name]
- Status: Active
- Detected: [Date/Time]
- Decomposition: [Phases]
- First task queued: [Task name]
- Timeline: [Estimate]
- Next review: [Date]
```

---

## 🛡️ Anti-Patterns (What We're Fixing)

❌ Project created but not analyzed
❌ SOW not broken into tasks
❌ No clear phases or timeline
❌ Tasks not queued for agents
❌ Project progress not monitored
❌ Stalled projects not escalated

✅ **This workflow prevents all of these.**

---

## Implementation Checklist

- [ ] Add project detection to autonomy heartbeat
- [ ] Create decomposition automation (template-based)
- [ ] Update HEARTBEAT.md with project monitoring
- [ ] Log every project to memory with status/plan
- [ ] Ensure tasks auto-queue when project created
- [ ] Tim receives briefing within 30 min of project creation

---

**Ownership:** Lucy (autonomous, no permission needed)
**Frequency:** Every heartbeat (30-60 min)
**Success:** Zero projects slip through; all active work tracked and progressing
