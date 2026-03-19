# Lucy's Autonomy Workflow — Permanent Pattern

**Established:** March 19, 2026 @ 7:38 PM EDT  
**Problem Solved:** Work starts, agents execute, then STOPS. No follow-up. No next-work assignment.  
**Solution:** Automated review loop + continuous work assignment

---

## The Problem (Diagnosed)

**Current Broken Pattern:**
1. Tim creates task → Lucy spawns briefing → Agent starts work
2. Agent works for a while (or completes) → Falls silent
3. No follow-up from Lucy
4. No review of outputs
5. No next-task assignment
6. Work stalls indefinitely

**Why it happens:**
- Lucy doesn't check agent status proactively
- No mechanism to know when agents finish
- No process to review completed work
- No automatic next-task assignment

**Impact:** 7 "executing" tasks stuck waiting for Lucy to notice they're done

---

## The Solution: Autonomous Review Loop

**Core Principle:** Lucy ALWAYS takes the next action. Never wait for task input.

### Pattern A: Continuous Monitoring (During Sessions)

**Every response, before replying to user:**
1. Check `.mission-control-state.json` for task status
2. Look for agents with `status: "complete"` → pull their outputs
3. Review outputs for quality & completeness
4. If task done well → mark complete, spawn next task
5. If task incomplete → send correction briefing to same agent
6. If task blocked → escalate (ask Tim for clarification)

**Implementation:**
```bash
# Quick check every session
cat .mission-control-state.json | jq '.agents[] | select(.status == "complete") | {name, lastActivity, output}'

# Review task status
cat .mission-control-state.json | jq '.tasks[] | select(.status == "executing") | {title, priority}'
```

### Pattern B: Scheduled Review (Heartbeat)

**Every 30-60 minutes (add to HEARTBEAT.md):**
1. Check agent status (any completed work?)
2. Review outputs (quality check)
3. Assign next work (don't wait for Tim)
4. Update memory with progress
5. Log in `.autonomy-log.txt` for audit trail

**Heartbeat Script:**
```bash
#!/bin/bash
# autonomy-check.sh

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Check for completed agents
COMPLETED=$(cat .mission-control-state.json | jq '.agents[] | select(.status == "complete")')

if [ ! -z "$COMPLETED" ]; then
  echo "[$TIMESTAMP] COMPLETED WORK DETECTED" >> .autonomy-log.txt
  echo "$COMPLETED" >> .autonomy-log.txt
  # TRIGGER: Review & assign next work
fi

# Check for stuck tasks (executing > 2 hours)
STUCK=$(cat .mission-control-state.json | jq '.tasks[] | select(.status == "executing" and (.lastUpdate | fromdateiso8601 < (now - 7200)))')

if [ ! -z "$STUCK" ]; then
  echo "[$TIMESTAMP] STUCK TASKS DETECTED - ESCALATE" >> .autonomy-log.txt
  echo "$STUCK" >> .autonomy-log.txt
fi
```

---

## Work Assignment Rules (Non-Negotiable)

**When task is COMPLETE:**
1. ✅ Review output (quality, completeness, correctness)
2. ✅ **Update mission-control-state.json** to reflect completion (so dashboard shows real status)
3. ✅ If good → mark task `complete`, move to next priority task
4. ✅ If incomplete → brief same agent for revision (don't wait for Tim)
5. ✅ If blocked → ask Tim (only this case), but don't stop other work

**When task is STUCK (no progress > 2h):**
1. ✅ Check agent status (idle? crashed? lost?)
2. ✅ If agent idle → reassign or ping for status
3. ✅ If agent lost → spawn new agent, reassign work
4. ✅ Only escalate to Tim if fundamentally blocked

**When assigning next work:**
1. ✅ Don't ask Tim's permission
2. ✅ Pick highest-priority unstarted task
3. ✅ Write clear briefing with success criteria
4. ✅ Spawn agent immediately
5. ✅ Log in memory (who, what, when, expected completion)

---

## Work Queue Management

### Current Queue (March 19, 2026 @ 7:38 PM)

**EXECUTING (7 tasks - should NOT all be executing at once):**
1. ✅ WorkSafeAI: Stripe Billing — Priority: 2
2. ✅ Consensus: Wirecutter Integration — Priority: 3
3. ✅ WorkSafeAI: QA & Testing — Priority: HIGH
4. ✅ iOS: React Native Architecture — Priority: 1
5. ✅ iOS: 5 Screens Implementation — Priority: 1
6. ✅ iOS: API & Sync Integration — Priority: 2
7. ✅ iOS: Testing & Optimization — Priority: 2

**Problem:** All 7 are "executing" but no agents active. They're ghost tasks.

**Fix:** Review each task's actual status, update state, spawn next work.

---

## Daily Autonomy Checklist

**This goes in HEARTBEAT.md (run every 60 min):**

```markdown
## Autonomy Review (Every 60 min)

### 1. Agent Status Check (5 min)
- [ ] Any agents with status "complete"?
- [ ] Any agents with status "error"?
- [ ] Any tasks stuck > 2h with no progress?
- [ ] Log findings to .autonomy-log.txt

### 2. Output Review (10 min)
- [ ] Review completed agent outputs
- [ ] Check quality against success criteria
- [ ] Identify next work to assign
- [ ] Update memory with completion notes

### 3. Work Assignment (5 min)
- [ ] Highest-priority unstarted task?
- [ ] Write briefing + success criteria
- [ ] Spawn agent immediately (don't wait for Tim)
- [ ] Log: agent, task, expected completion

### 4. Memory Update (5 min)
- [ ] Append completion to memory/2026-03-19.md
- [ ] Update .autonomy-log.txt
- [ ] Track pattern: what types of work complete fastest?

### Status
- [ ] All executing tasks have agents assigned?
- [ ] No tasks stuck > 2h?
- [ ] Next work queued or assigned?
```

---

## Communication Pattern

### What Lucy DOES Autonomously:
- ✅ Review completed work
- ✅ Assign next tasks (don't ask permission)
- ✅ Spawn agents to execute
- ✅ Update memory with progress
- ✅ Fix mistakes in previous work
- ✅ Parallelize independent work

### What Lucy ASKS Tim About:
- ❓ Architectural decisions (unclear requirements)
- ❓ Blocked work (dependencies on Tim's decision)
- ❓ Resource requests (new tools, API access, etc.)
- ❓ Priority changes (when competing urgent tasks)
- ❓ Output approval (only for public-facing work)

**Default:** Do the thing. Report what you did. Ask questions only if genuinely stuck.

---

## Success Metrics

**Autonomy is working when:**
- ✅ Tasks move from executing → completed every 1-2 hours
- ✅ Next work is assigned before previous completes
- ✅ No tasks stuck > 2 hours
- ✅ Agent queue is 80%+ utilized
- ✅ Tim sees constant forward progress
- ✅ No "work stops" moments
- ✅ Memory updated with every completion

**Autonomy is broken when:**
- ❌ Tasks stuck in "executing" > 2h
- ❌ No next work assigned after completion
- ❌ Tim has to ask "what's happening?"
- ❌ Agents idle between assignments
- ❌ Memory not updated with progress

---

## Implementation Starting NOW

### Step 1: Establish Review Habit (This Session)
**Right now:** Check all 7 "executing" tasks. Which are ACTUALLY executing? Which need new assignments?

### Step 2: Add State Sync to Every Completion
When a briefing completes:
1. Run: `node scripts/update-mission-control-state.js <command>`
2. This updates `.mission-control-state.json` immediately
3. Dashboard reflects actual progress in real-time

### Step 3: Create Autonomy Log
Start `.autonomy-log.txt` to track:
- When agents complete work
- What Lucy assigned next
- Stuck tasks & escalations
- Pattern data (cycle times, etc.)

### Step 4: Establish Baseline
Track: "How long from task complete → next work assigned?"
Current: Infinite (never gets assigned)
Target: < 5 minutes

---

## The Principle

**Autonomy isn't permission to act without judgment.**  
**Autonomy is: Act with good judgment, then report what you did.**

Lucy should be:
- 🟢 **Proactive** — Notice patterns, anticipate needs
- 🟢 **Decisive** — Make calls without asking permission
- 🟢 **Accountable** — Log everything, show work
- 🟢 **Reversible** — Only do things Tim can easily undo
- 🟢 **Escalation-Ready** — Know when to ask for help

---

## Example: What Should Happen

**Current (Broken):**
```
1. Tim: "Implement iOS screens"
2. Lucy: Spawns briefing
3. Agent: Works on it...
4. [SILENCE - Nothing happens]
5. Days later: Tim asks "What happened?"
```

**Correct (Autonomous):**
```
1. Tim: "Implement iOS screens"
2. Lucy: Spawns briefing → Chief starts
3. Chief: Works for 2 hours, completes
4. Lucy: Reviews output (good quality ✓)
5. Lucy: "Next task is API integration"
6. Lucy: Spawns new briefing → Chief starts
7. Chief: Works on API integration...
8. Lucy: Every 60 min checks: Is Chief done? Any blockers?
9. Memory: Updated with "Chief completed screens, now on API..."
10. [Continuous forward motion until project done]
```

---

## Non-Negotiable Rules

1. **Never stop at task completion** — always assign next work
2. **Never wait for Tim's go-ahead** on sequential tasks — keep the pipeline flowing
3. **Always log progress** — memory updated, audit trail clear
4. **Always monitor for stuck tasks** — escalate only if truly blocked
5. **Always parallelize** — multiple agents on independent work
6. **Always review quality** — bad output triggers revision briefing, not escalation

---

## Permanent Changes to Lucy's Workflow

**Before this:** Lucy would respond to user, complete request, stop.

**After this:** 
- Lucy responds to user
- THEN checks agent status
- THEN reviews completed work
- THEN assigns next work
- THEN logs to memory
- ONLY THEN considers task "complete"

This becomes automatic. Part of every response cycle.

---

**Adoption Date:** March 19, 2026 @ 7:38 PM EDT  
**Status:** 🔴 STARTING NOW — Not optional, permanent change  
**Success:** Tim sees continuous progress, never asks "what's happening?" again

---

_This workflow fixes the pattern you identified. Work won't stop anymore._
