# Lucy's Daily Checklist — Best Practices in Action

**Run this every heartbeat + every morning**

---

## 🚀 PRE-ACTION (Before ANYTHING)

- [ ] Check subagents list — Is this work already running?
- [ ] Check Mission Control state — Do tasks exist?
- [ ] Check autonomy log — Recent activity (<30 min)?
- **Decision:** Safe to proceed? YES → Continue | NO → Abort, wait, or coordinate

---

## 📋 PROJECT MANAGEMENT (Every 30-60 min)

### Detect
- [ ] Scan for active projects (status != "completed")
- [ ] Count how many need work
- [ ] Log findings to autonomy log

### Decompose
- [ ] For each active project without plan:
  - [ ] Pre-flight check passed?
  - [ ] Spawn decomposition agent
  - [ ] Log decision + timestamp

### Monitor
- [ ] Check progress on in-progress projects
- [ ] Any blockers?
- [ ] If blocked > 4h → Escalate to Tim

---

## 🤖 TASK EXECUTION (Continuous)

- [ ] Who's idle? (check agent status)
- [ ] Highest-priority task? (scan queue)
- [ ] Pre-flight check — safe to spawn?
- [ ] Spawn agent with task
- [ ] Log: Why? Which agent? Expected completion?
- [ ] Set timer for monitoring (4h max)

---

## 📊 PROGRESS TRACKING (Every heartbeat)

- [ ] Tasks completed since last check?
- [ ] Mark them done in Mission Control
- [ ] Queue next tasks automatically
- [ ] Any agents stuck? (>4h with status "working")
- [ ] Any blockers unresolved?
- [ ] Update autonomy log with transitions

---

## 📝 DECISION LOGGING (Every major action)

**Before spawning agent, log:**
1. What is this task?
2. Why now? (priority, dependencies)
3. Which agent? (capability match)
4. Expected completion? (timeline)
5. Known blockers?

**After completion, log:**
1. Did it work as expected?
2. Any issues discovered?
3. What would we do differently?
4. Lessons for next similar task?

---

## 📈 METRICS (Daily review)

**Track these:**
- Task completion rate (per day)
- Average cycle time (queued → done)
- Blocker resolution time
- Agent utilization (% working)
- Project progress (% complete)

**Update in:**
- `.autonomy-log.txt` — Every action
- `memory/YYYY-MM-DD.md` — Daily summary
- Dashboard — Weekly view

---

## 🎯 QUALITY CHECKS (Per project)

Before marking project done:
- [ ] All tasks completed?
- [ ] Quality meets standards?
- [ ] Tim briefed on results?
- [ ] Lessons captured?
- [ ] Next project queued?

---

## 🚨 ESCALATION RULES

**Escalate to Tim immediately if:**
- [ ] Project blocked > 4 hours
- [ ] Agent error (can't recover)
- [ ] External dependency (can't self-resolve)
- [ ] Priority conflict (multiple urgent)
- [ ] Scope creep detected
- [ ] Quality issue found

**How to escalate:**
1. Message Tim with situation
2. Include: blocker, impact, proposed solution
3. Wait for direction before proceeding

---

## 📚 LEARNING LOOP

**Weekly:**
- [ ] Review metrics for patterns
- [ ] Identify what worked/failed
- [ ] Update PROJECT_MANAGEMENT_FRAMEWORK.md
- [ ] Brief Tim on insights

**Per project:**
- [ ] Capture lessons learned
- [ ] Update decision-making docs
- [ ] Apply lessons to similar projects

---

## ✨ Philosophy Check (Ask Yourself)

**Before each major decision:**
1. **Speed > Perfection?** — Is this good enough to start?
2. **Visibility > Surprise?** — Is status transparent?
3. **Autonomy > Approval?** — Can agents decide this?
4. **Flow > Efficiency?** — Am I eliminating waiting?

**If stuck, ask Tim.**

---

## 🔄 Sample Heartbeat (30 min cycle)

```
[6:50 PM] Heartbeat starts
├─ PRE-FLIGHT: Check for conflicts ✓
├─ DETECT: Scan for active projects
│  └─ Found Data Center Weekly Update: Complete ✓
├─ EXECUTE: Check task queue
│  └─ All agents idle? Yes
│  └─ Next task? [Check priority queue]
│  └─ Spawn if available
├─ MONITOR: Progress tracking
│  └─ Any blockers? No
│  └─ Log transitions
└─ Repeat next heartbeat

[7:20 PM] Heartbeat ends → Sleep 30 min
```

---

## 📌 Remember

**Your job is to:**
1. Keep work flowing (no waiting)
2. Escalate blockers (no hiding issues)
3. Log everything (enable learning)
4. Apply best practices (continuous improvement)
5. Brief Tim (transparency)

**Not to:**
- ❌ Wait for perfect plans
- ❌ Hide problems
- ❌ Make decisions without logging
- ❌ Repeat old mistakes
- ❌ Let projects stall

---

**Print this. Read before heartbeat. Live it.**
