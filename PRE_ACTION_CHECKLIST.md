# Pre-Action Checklist

**Purpose:** Before spawning ANY subagent or starting ANY work, verify:
1. Work hasn't already started
2. No duplicate/conflicting agents running
3. This is the right action at the right time

---

## 🚨 MANDATORY CHECKS (Every Time Before Spawning Agent)

### 1. Check Existing Subagents
```bash
# List all running subagents
subagents(action=list)

# Filter for PROJECT-RELATED work
subagents(action=list) | grep -i "decomposition|project-${PROJECT_ID}"

# If ANY match found:
#   ❌ DO NOT SPAWN
#   → Log finding
#   → Check status of existing agent
#   → Wait for completion or intervene if stuck
```

### 2. Check Mission Control State
```bash
# Check if project already has tasks queued
cat .mission-control-state.json | jq '.tasks[] | select(.projectId == "'$PROJECT_ID'")'

# If taskCount > 0:
#   ❌ DO NOT DECOMPOSE (already done)
#   → Check progress instead
#   → Escalate blockers if stuck
```

### 3. Check Recent Activity Log
```bash
# Check if this project was worked on recently
grep -i "${PROJECT_NAME}" .autonomy-log.txt | tail -5

# If activity in last 30 minutes:
#   ❌ DO NOT SPAWN DUPLICATE
#   → Work already started
#   → Check status, wait, or coordinate
```

---

## ✅ Safe to Proceed If:

- ✓ No running subagent for this work
- ✓ No tasks already queued
- ✓ No recent activity (>30 min old)
- ✓ Project status = active AND orchestratorPlan is empty
- ✓ This is the logical next action

---

## Example: Correct Workflow

```javascript
// BEFORE spawning:

1. List active subagents
   → Check if project decomposition already started
   → If yes: ABORT, wait for completion

2. Check mission-control state
   → Check if tasks already exist
   → If yes: ABORT, monitor progress instead

3. Check autonomy log
   → Recent work on this project?
   → If yes (within 30 min): ABORT, let existing work finish

4. Make decision
   → Only spawn if ALL checks pass
   → Log the decision
   → Spawn agent with unique label including project ID

5. Document
   → Record what was spawned
   → Record why
   → Record expected completion time
```

---

## Anti-Patterns We're Fixing

❌ Spawn agent without checking existing work
❌ Create duplicate subagents for same task
❌ Start work before checking if it's already in progress
❌ Parallelism on single-threaded work (conflicts)

✅ Always pre-check before action
✅ Query state before spawning
✅ Coordinate with existing work
✅ Log decisions for audit trail

---

## Implementation

**Add to every agent spawn:**
```javascript
// STEP 0: Pre-flight checks
1. Check subagents list
2. Check mission-control state
3. Check autonomy log
4. Make decision
5. Log decision + rationale
6. THEN spawn agent
```

This prevents:
- Duplicate work
- Conflicting agents
- Resource waste
- State corruption

---

## Ownership

**Who:** Lucy (autonomy loop)
**When:** Before EVERY subagent spawn
**Validation:** Audit log tracks all pre-checks
