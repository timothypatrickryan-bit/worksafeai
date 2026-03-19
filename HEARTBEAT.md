# HEARTBEAT.md - Periodic Tasks

## Mission Control Status (Every Heartbeat) ✅ AUTOMATED

**Auto-run on every heartbeat:**
```bash
node scripts/heartbeat-mission-control.js
```

**Checks for:**
- ⚠️ Tasks awaiting your review (Approve/Reject)
- ✅ Tasks queued and ready to run
- 📬 Messages waiting to be sent
- 🚨 Critical alerts requiring action
- 🤖 Agent status (idle/working/complete)

**Action Triggers:**
- If tasks pending review → Report them and remind to approve/reject
- If messages ready → Remind to send them
- If agents idle and no queued tasks → Suggest creating new work
- If critical alerts → Escalate immediately

**Output Example:**
```
📊 BOARD SUMMARY:
   Tasks Awaiting Review: 2
   Tasks Queued: 1
   Messages Ready to Send: 3
   Critical Alerts: 0

🤖 AGENTS:
   Idle: 2
   Working: 0
   Complete: 1

⚠️  AWAITING YOUR REVIEW:
   [1] Review Q2 pricing strategy
   [2] Analyze competitor landscape
```

---

## WorkSafeAI Code Reviews (Manual - Run as Needed)

- To spawn Opus 4.6 code review, manually request it
- Focus: Security, bugs, design issues, missing code
- Auto-fix any issues found (don't wait for approval)
- Report summary of findings + fixes applied

## Daily Gap Analysis Review (Once per day - PRIORITY)

**Run once daily (suggest: 9 AM EST)**

This autonomous task reviews progress toward the mission:
> "An autonomous organization of AI agents that does work for me and produces value 24/7"

**What it does:**
1. **Read current GAP Analysis grades** (from Mission Control dashboard)
2. **Identify Critical Priority items** with low scores (1-2)
3. **Pick the highest-impact improvement** for that day
4. **Execute work** to move that area forward (delegate to appropriate agent)
5. **Log progress** to memory/YYYY-MM-DD.md

**Priority Order (work on these in order):**
1. 🤖 **Autonomy & Independence** (Critical) — agents should make decisions independently
2. 💰 **Value Generation & Delivery** (Critical) — measurable output & business impact
3. 🏗️ **Organization & Structure** (High) — clear roles, coordination, specialization
4. 📈 **Scalability & Growth** (High) — grow team/workload efficiently
5. 🛡️ **Reliability & Resilience** (High) — uptime, error recovery, data integrity
6. 👤 **Human-AI Collaboration** (Medium) — transparency, feedback loops, trust

**Example Daily Work:**
```
Day 1: Autonomy → Add error recovery to agents
Day 2: Value Generation → Measure output quality
Day 3: Organization → Document agent specialties
Day 4: Scalability → Automate agent provisioning
Day 5: Reliability → Add monitoring & alerting
Day 6: Collaboration → Improve decision transparency
```

**Files to check:**
- `.mission-control-state.json` — Current assessment grades
- `apps/mission-control/` — GAP Analysis component
- `memory/YYYY-MM-DD.md` — Daily progress log

---

## Lucy Autonomy Loop (Every Heartbeat - HIGHEST PRIORITY) ⭐

**THIS IS THE CORE WORKFLOW — RUNS EVERY 60 MINUTES**

**What Lucy does autonomously (no permission needed):**

```bash
# 1. Check agent status (completed work?)
cat .mission-control-state.json | jq '.agents[] | select(.status == "complete")'

# 2. Review outputs (quality check)
# [Review output for completeness, correctness, quality]

# 3. Assign next work (queue priority)
# [Pick highest-priority unstarted task]

# 4. Spawn agent immediately
# sessions_spawn(task, runtime="subagent")

# 5. Log to memory + autonomy log
# [Append to memory/YYYY-MM-DD.md + .autonomy-log.txt]
```

**Success = Work Never Stops**
- Task completes → Next task assigned < 5 min
- No gaps, no waiting, no "What's happening?" questions
- Agents always have work queued
- Tim sees continuous progress

**See:** AUTONOMY_WORKFLOW.md for complete pattern

**Files:**
- `.autonomy-log.txt` — Audit trail of all work transitions
- `AUTONOMY_WORKFLOW.md` — The permanent pattern
- `memory/2026-03-19.md` — Daily progress

---

## Lucy Task Automation (Every Heartbeat - PRIORITY)

**Auto-run on every heartbeat:**
```bash
node scripts/lucy-task-automation.js
```

**What it does:**
1. **Scans for Lucy tasks** (status: queued or pending, assigned to Lucy)
2. **Analyzes each task** (classifies by type: design, development, research, strategy, security, quality)
3. **Matches to best agent** (calculates score 0-10 based on specialties and category)
4. **Creates delegation plan** (identifies primary agent + secondary reviews if needed)
5. **Delegates work** (updates task status, creates delegation record, assigns to best agent)
6. **Logs everything** (activity feed, delegation history, audit trail)

**Task Flow:**
```
You create task → Assign to Lucy → Automation detects
→ Lucy analyzes (via automation) → Delegates to best agent
→ Agent executes → Reports results
```

**Automation Triggers:**
- If task assigned to Lucy with status "queued" or "pending"
- Lucy analyzes and delegates to execution team
- Task moves to "in-progress"
- Delegation record created for agent
- Activity logged for tracking

**Files:**
- `scripts/lucy-task-automation.js` — Task processor
- `.lucy-automation.log` — Automation activity log (last 100 entries)
- `.lucy-delegations.json` — All delegation records from Lucy

---

## Mission Control Check (Every Heartbeat - PRIORITY)

1. **Read current state**
   ```bash
   node scripts/mission-control.js read
   ```

2. **Check for alerts**
   - 🚨 Critical alerts? Notify Tim immediately
   - ⚠️ Project health issues? Log and monitor

3. **Process inbox items**
   - Find all items with `status: "ready-to-send"`
   - For items to Kelly → send via WhatsApp (if integrated)
   - For items to Tim → send via Telegram
   - Mark as `status: "sent"` when complete

4. **Update agent statuses**
   - Are agents stuck in "working"? Flag for investigation
   - Mark successful completions as "idle"

5. **Log activity**
   - Append to `.mission-control-log.txt`
   - Track: alerts, inbox items processed, agent transitions

**Files:**
- `.mission-control-state.json` — Current state
- `scripts/mission-control.js` — CLI tool
- `MISSION_CONTROL.md` — Architecture
- `AGENT_COORDINATION.md` — How agents use it

---

## LinkedIn Content Posting (✅ FULLY AUTOMATED - Tue/Thu/Sat @ 9 AM EST)

**Status:** 🟢 **DEPLOYED** - Ready to activate (March 15, 2026 @ 10:03 AM)

**Account:** tim.ryan@pro-tel.com  
**Topics:** Data Center, Telecommunications, Wireless Industry  
**Schedule:** Automated via macOS launchd (or traditional cron)  
**Method:** Post generation + browser relay posting

**Automation Pipeline:**
1. ✅ **9:00 AM EST trigger** — launchd job (Tue/Thu/Sat)
2. ✅ **Post generation** — Auto-creates topic-relevant content
3. ✅ **Alternating topics** — Industry Insight → Trending Topic → Insight
4. ✅ **Browser relay posting** — Posts to LinkedIn via authenticated session
5. ✅ **Logging & tracking** — Records all activity

**Core Files:**
- `scripts/linkedin-post-now.js` — Post generator (any time)
- `scripts/linkedin-auto-post.sh` — Scheduled automation runner
- `scripts/linkedin-browser-post-automation.js` — Browser posting helper
- `~/Library/LaunchAgents/com.openclaw.linkedin-auto-post.plist` — macOS scheduler
- `.linkedin-current-post.json` — Latest generated post
- `.linkedin-posts.log` — Complete posting history
- `.linkedin-posts-published.log` — Published posts only

**What's Automated:**
- ✅ Content generation (Tue/Thu/Sat @ 9 AM)
- ✅ Scheduling (macOS launchd)
- ✅ Topic alternation (Insight → Trending → Insight)
- ✅ Post logging (all activity tracked)
- ⏳ Browser posting (requires Chrome relay active)

**Setup Status (March 15):**
- ✅ All scripts created and tested
- ✅ macOS launchd plist configured
- ✅ Post generation verified working
- ✅ Logging infrastructure in place
- ✅ Browser relay integration ready

**Next Steps:**
1. Activate launchd job (one-time): See LINKEDIN_SETUP_FINAL.md
2. Open LinkedIn in Chrome with OpenClaw Browser Relay active
3. Automation runs automatically Tue/Thu/Sat @ 9 AM EST

**Manual Post (Any Time):**
```bash
node scripts/linkedin-post-now.js insight  # or: trending
cat .linkedin-current-post.json | jq '.fullPost'
```

**Check Status:**
```bash
launchctl list | grep linkedin          # Verify scheduler active
tail -20 .linkedin-posts.log             # View posting history
```

**Full Setup Guide:**
See: `LINKEDIN_SETUP_FINAL.md` for complete installation & monitoring
