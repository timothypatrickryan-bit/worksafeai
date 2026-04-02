# HEARTBEAT.md - Periodic Tasks

## 📖 Agent Guides (READ THESE FIRST)

**For all agents executing work on Tim's behalf:**

- **MISSION_CONTROL_AGENT_GUIDE.md** — Complete system guide for all agents
- **LUCY_OPERATIONAL_PLAYBOOK.md** — How Lucy operates day-to-day
- **MISSION_CONTROL_QUICK_REF.md** — Quick lookup reference

**Start new work?** Read these guides first. They explain:
- How to create briefings
- When to ask for approval
- How to update task status
- How to document decisions
- How to handle blockers

---

## 🚀 AUTOMATED JOBS (macOS launchd)

**Both jobs now running automatically (every 30-60 minutes):**

### 1. **Autonomy Loop** (Every 30 minutes - HIGHEST PRIORITY)
- **Job:** `com.openclaw.autonomy-loop`
- **Script:** `scripts/autonomy-heartbeat.js`
- **Frequency:** Every 1800 seconds (30 minutes)
- **What it does:**
  - Checks for completed agent work
  - Reviews executing task progress
  - Monitors for stuck tasks (>4h with no progress)
  - Logs all transitions to `.autonomy-log.txt`
  - Enables real-time awareness of work status

### 2. **Mission Control Heartbeat** (Every 60 minutes)
- **Job:** `com.openclaw.heartbeat-mission-control`
- **Script:** `scripts/heartbeat-mission-control.js`
- **Frequency:** Every 3600 seconds (60 minutes)
- **What it does:**
  - Processes queued tasks → generates briefings
  - Updates task statuses
  - Reports pending work to console
  - Logs activity for audit trail

**Status Check:**
```bash
launchctl list | grep -E "heartbeat|autonomy"
```

**Logs:**
```bash
tail -f /Users/timothyryan/.openclaw/workspace/.autonomy-heartbeat.log
tail -f /Users/timothyryan/.openclaw/workspace/.heartbeat-mission-control.log
```

**Unload (if needed):**
```bash
launchctl unload ~/Library/LaunchAgents/com.openclaw.autonomy-loop.plist
launchctl unload ~/Library/LaunchAgents/com.openclaw.heartbeat-mission-control.plist
```

**Reload (restart):**
```bash
launchctl unload && launchctl load ~/Library/LaunchAgents/com.openclaw.autonomy-loop.plist
```

---

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

---

## Execution Tracking System (✅ LIVE - Real-time monitoring)

**Status:** 🟢 **DEPLOYED** - March 28, 2026 @ 9:10 AM EST

**Purpose:** Real-time task execution monitoring with automatic blocker detection + state updates

**Core Scripts:**
1. **execution-tracker.js** — Detects blocked/completed tasks (run every 30-60 min)
2. **briefing-context-injector.js** — Adds execution context to agent briefings
3. **parse-agent-response.js** — Extracts completion signals from agent responses
4. **auto-update-task-status.js** — Pushes updates to `.mission-control-state.json`

**How It Works:**
```
Agent briefing → [inject context] → Agent executes
  ↓
Agent response → [parse signals] → [auto-update state]
  ↓
Execution tracker → [detect blockers] → Mission control updated
```

**Execution Signals (agents include in responses):**
- `[TASK_COMPLETE]` = task finished
- `[EXECUTION_UPDATE]` = progress update  
- `[TASK_BLOCKED]` = blocker encountered
- `[DELIVERABLE]` = output file path

**Manual Tracking:**
```bash
# Run execution tracker
node scripts/execution-tracker.js

# View execution logs
cat execution-logs/2026-03-28.jsonl

# Check task status
cat .mission-control-state.json | jq '.tasks[]'
```

**Files:**
- `EXECUTION_TRACKING_SYSTEM.md` — Complete documentation
- `execution-logs/` — Daily JSONL audit trail
- `.execution-tracker.log` — System logs
- `.task-update.log` — State update history

---

## Lucy Autonomy Loop (Every Heartbeat - HIGHEST PRIORITY) ⭐

**THIS IS THE CORE WORKFLOW — RUNS EVERY 60 MINUTES**

**What Lucy does autonomously (no permission needed):**

```bash
# 1. Track execution (detect blockers + completions)
node scripts/execution-tracker.js

# 2. Check agent status (completed work?)
cat .mission-control-state.json | jq '.tasks[] | select(.status == "complete")'

# 3. Review outputs (quality check)
# [Review output for completeness, correctness, quality]

# 4. Assign next work (queue priority)
# [Pick highest-priority unstarted task]

# 5. Inject context (include execution history)
node scripts/briefing-context-injector.js <taskId>

# 6. Spawn agent immediately
# sessions_spawn(task, runtime="subagent", context=<injected>)

# 7. Parse response + auto-update
# [Detect [TASK_COMPLETE] / [BLOCKED] signals]
# node scripts/parse-agent-response.js <response>
# node scripts/auto-update-task-status.js <taskId> <update.json>

# 8. Log to memory + autonomy log
# [Append to memory/YYYY-MM-DD.md + .autonomy-log.txt]
```

**Success = Work Never Stops**
- Task completes → Next task assigned < 5 min
- Blockers detected automatically within 4 hours
- Execution history visible in real-time
- Mission control state always in sync
- Tim sees continuous progress + blockers

**See:** AUTONOMY_WORKFLOW.md + EXECUTION_TRACKING_SYSTEM.md for complete pattern

**Files:**
- `.autonomy-log.txt` — Audit trail of all work transitions
- `.execution-tracker.log` — Real-time tracking logs
- `execution-logs/` — Daily execution history (JSONL)
- `.mission-control-state.json` — Auto-updated task state
- `AUTONOMY_WORKFLOW.md` — The permanent pattern
- `EXECUTION_TRACKING_SYSTEM.md` — Tracking system documentation
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

## Research → Staging → Build Pipeline (✅ LIVE - Autonomous Improvements)

**Status:** 🟢 **LIVE & AUTOMATED** - Activated March 28, 2026 @ 10:05 PM EST

**Purpose:** Complete autonomous self-improvement loop

**Workflow:**

### 1️⃣ 11:45 PM — Nightly AI Research & Self-Reflection
- Scan latest AI research (HuggingFace, GitHub, arXiv, LLM trends)
- Reflect on daily performance (task completions, autonomy metrics)
- Identify relevant papers and improvements
- Evaluate if findings should change operations
- Output: Daily research report with recommendations

### 2️⃣ 12:00 AM — Research-to-Staging Pipeline  
- Read nightly research findings
- Evaluate safety of each recommendation
- Create staged improvements (ready-to-build status)
- Filter by: Safe + High-priority = Approve for 4 AM build
- Output: Staged work manifest with build plan

### 3️⃣ 4:00 AM — Execute Staged Improvements
- Check for staged improvements ready to build
- Safety validation (pre-build checks)
- Build improvement
- Test thoroughly (5-test suite)
- Deploy if all tests pass
- Monitor health (24 hours)
- Log to memory

**Scripts & Automation:**
- `scripts/nightly-ai-research.js` (11:45 PM) — Research scanner
- `scripts/research-to-staging.js` (run after research) — Safety evaluator
- `scripts/execute-staged-improvements.js` (4:00 AM) — Build executor
- `staged-improvements/` — Staging directory (work queued here)
- `built-improvements/` — Completed improvements (history)
- `research-logs/` — Daily research reports

**Safety Controls:**
- ✅ Pre-approved areas: Autonomy, Agent Coordination, Self-Improvement, Scalability, Monitoring
- ✅ Requires: High-priority + Safe rating to queue for build
- ✅ Pre-deployment: 5-test validation suite
- ✅ Rollback: Always available (reversible changes only)
- ✅ Monitoring: 24-hour post-deployment health checks

**Example Workflow (Autonomous):**

```
11:45 PM — Research finds: "Multi-agent orchestration advances"
          → "Could improve agent coordination"
          
12:00 AM — Safety evaluation: ✅ Safe, ✅ High-priority
          → Staged for 4 AM build
          
4:00 AM  — Build executor runs:
          1. ✅ Safety validation passed
          2. ✅ Implementation built (15 min)
          3. ✅ All tests passed (5/5)
          4. ✅ Deployed to production
          5. 📊 Health monitored (24h)
```

**What Stops a Build:**
- ❌ Safety validation fails
- ❌ Test failures (any)
- ❌ Not high-priority
- ❌ Not in pre-approved areas
- ❌ Risky or unknown changes

**Deployment Status:**
- ✅ Nightly research: ACTIVE (11:45 PM)
- ✅ Research-to-staging: READY (post-research)
- ✅ 4 AM builds: ACTIVE (tested, launching at 4:00 AM)
- ✅ Monitoring: ACTIVE (24h post-deploy)

---

## Nightly AI Research & Self-Reflection (✅ LIVE - Daily @ 11:45 PM EST)

**Status:** 🟢 **LIVE & AUTOMATED** - Activated March 28, 2026 @ 10:01 PM EST

**Purpose:** Continuous learning loop — scan AI research, reflect on daily performance, evaluate operational improvements

**Schedule:** Daily @ 11:45 PM EST via macOS launchd  
**Method:** Brave Search API + Performance analysis + Research synthesis  

**Workflow:**
1. ✅ **Scan AI Research** (HuggingFace, GitHub Trending, arXiv, LLM trends)
2. ✅ **Reflect on Performance** (Task completions, autonomy metrics, execution quality)
3. ✅ **Research Top Papers** (Identify relevant advances in multi-agent systems, reasoning, autonomy)
4. ✅ **Evaluate Changes** (Should findings change how I operate?)
5. ✅ **Log Insights** (Daily research report with recommendations)

**Core Files:**
- `scripts/nightly-ai-research.js` — Research scanner + analysis engine
- `~/Library/LaunchAgents/com.openclaw.nightly-ai-research.plist` — Scheduler (ACTIVE)
- `research-logs/` — Daily reports (YYYY-MM-DD-research-report.json)
- `.nightly-research.log` — Automation logs

**What's Automated:**
- ✅ Research scanning (7 key queries: HuggingFace, GitHub, arXiv, LLM, agents, reasoning, multi-agent)
- ✅ Performance reflection (autonomy log, mission control state analysis)
- ✅ Paper identification (matches research to operational priorities)
- ✅ Improvement evaluation (generates actionable recommendations)
- ✅ Report generation (JSON with summary, insights, priority decisions)

**Live Deployment (March 28, 2026):**
- ✅ Scanner script built and tested
- ✅ launchd job installed and active
- ✅ First research run successful (21 items scanned, 5 topics identified, 3 recommendations generated)
- ✅ Logging infrastructure in place

**Manual Run (Any Time):**
```bash
BRAVE_API_KEY="BSAHJ3Wmk1IbHNqEsACADrcFLfW5eLc" node scripts/nightly-ai-research.js
```

**Check Status:**
```bash
launchctl list | grep nightly-ai-research         # Verify scheduler active
tail -50 .nightly-research.log                     # View automation events
cat research-logs/YYYY-MM-DD-research-report.json # View today's report
```

**Example Output (First Run - March 29, 2026):**
```
✅ Research Summary:
   Research Items Scanned: 21
   Topics Identified: 5
   Recommended Improvements: 3
   Priority Decisions: 1

📚 Topics Found:
   • Multi-Agent Systems (4 items) — Agent coordination advances
   • Reasoning & Planning (3 items) — Chain-of-thought, tree-of-thought improvements
   • Autonomy & Self-Improvement (2 items) — Self-reflecting agents
   • Prompt Engineering (2 items) — Advanced techniques
   • Agentic AI Trends (1 item) — 2026 market outlook

🎯 Priority Recommendations:
   1. HIGH: Evaluate autonomy improvements (no task completions today)
   2. MEDIUM: Research multi-agent orchestration patterns
   3. MEDIUM: Implement self-reflection loops for continuous learning
```

**Research Sources Scanned:**
- HuggingFace Hub (new models, trends)
- GitHub (trending AI projects)
- arXiv (latest papers, research)
- LLM Prompt Engineering advances
- AI Agent improvements 2026
- Autonomous reasoning systems
- Multi-agent system architectures

**Key Insights (First Run):**
- OpenClaw trending on GitHub (60K+ stars)
- Nemotron-3 Nano models showing efficient reasoning
- Agentic AI predicted to add $2.6-4.4T value annually
- Multi-agent orchestration is 2026 trend
- Self-improving agents gaining research attention

---

## Hyperscaler Daily Update (✅ LIVE - Daily @ 7:00 AM EST)

**Status:** 🟢 **LIVE & AUTOMATED** - Activated March 25, 2026 @ 2:53 PM EST | **Updated March 27, 2026** - Email delivery configured

**Purpose:** Curated data center construction & fiber deployment news with verified links

**Account:** Tim Ryan  
**Email Delivery:** ✅ tim.ryan@pro-tel.com (Executive HTML format) — *Updated 9:25 AM EST March 27*  
**Topics:**
- Data center construction announcements
- Hyperscaler facility expansion news
- Fiber optic deployment announcements
- Undersea cable construction
- Fiber infrastructure investments
- Broadband fiber expansion

**Schedule:** Automated via macOS launchd (Daily @ 7:00 AM EST)  
**Method:** Brave Search API + Link validation + HTML email generation + SMTP delivery  
**API Key:** ✅ Configured (BSAHJ3Wmk1IbHNqEsACADrcFLfW5eLc)  
**Email Config:** ✅ Gmail SMTP (f5zothoi@gmail.com) via lucy@elevationaiagents.com

**Automation Pipeline:**
1. ✅ **7:00 AM EST trigger** — launchd job (Daily)
2. ✅ **Brave Search API** — Queries 8 specific search terms (data center + fiber)
3. ✅ **Link Validation** — Tests each article URL (404 check)
4. ✅ **Report Generation** — Creates curated report with verified links only
5. ✅ **Output Files** — Saves to `.hyperscaler-daily-report.txt` and `.hyperscaler-daily-articles.json`

**Core Files:**
- `scripts/hyperscaler-daily-update.js` — Main script (fetches, validates, reports)
- `scripts/install-hyperscaler-job.sh` — Installer script
- `~/Library/LaunchAgents/com.openclaw.hyperscaler-daily.plist` — macOS scheduler (ACTIVE)
- `.hyperscaler-daily-report.txt` — Latest report (human-readable)
- `.hyperscaler-daily-articles.json` — Article data (machine-readable)
- `.hyperscaler-daily.log` — Automation logs
- `.hyperscaler-daily-error.log` — Error tracking

**What's Automated:**
- ✅ Content search (Daily @ 7 AM, Brave Search API)
- ✅ Link validation (checks all URLs actually work)
- ✅ Report generation (categorized by topic)
- ✅ Scheduling (macOS launchd - LIVE)
- ✅ Logging (all activity tracked, broken links noted)

**Quality Control:**
- Only verified links included (404 check)
- Broken links logged and excluded
- Multiple search queries per category
- Real-time news + announcements focus
- Links tested at generation time

**Live Deployment (March 25, 2026):**
- ✅ Brave API key configured & tested
- ✅ Link validation implemented & working
- ✅ launchd job activated
- ✅ Logging infrastructure in place
- ✅ First run: 18 verified articles (9 data center, 9 fiber)

**Manual Run (Any Time):**
```bash
node scripts/hyperscaler-daily-update.js
```

**Check Status:**
```bash
launchctl list | grep hyperscaler         # Verify scheduler active
tail -50 .hyperscaler-daily.log             # View automation events
cat .hyperscaler-daily-report.txt          # View latest report
```

**Example Output:**
```
✅ Found 18 verified articles

📰 Data Center Construction (9 articles)
1. New Data Center Developments: March 2026
   Source: datacenterknowledge.com
   AVAIO Digital Partners announced $6B investment...
   🔗 [verified link]

📰 Fiber Deployment (9 articles)
1. Nokia launches optical solutions for AI-era networks
   Source: nokia.com
   New fiber deployment for AI workloads...
   🔗 [verified link]

Generated: 2026-03-25T18:52:53Z
All links verified and active ✅
```

---

## Project Warp Speed - Pro-Tel Growth Acceleration (🚀 ACTIVE)

**Status:** 🟢 **LAUNCHED** - March 25, 2026  
**Timeline:** 6 months (Target completion: September 25, 2026)  
**Investment:** $650K (Marketing, hiring, infrastructure)

**Strategic Objective:**
Accelerate Pro-Tel's growth by establishing market leadership in **Data Center Structured Cable and Infrastructure** across **Northeast region (PA & Upstate NY)**

**Key Work Streams:**
1. **Market Definition & Analysis** (Due April 15)
   - TAM analysis for Northeast data center infrastructure
   - Competitor mapping & customer segmentation
   - Growth trends analysis (AI, edge, fiber)

2. **Strategic Plan Development** (Due April 30)
   - SWOT analysis & competitive positioning
   - Revenue targets & expansion strategy
   - Product/service portfolio alignment

3. **Internal Capabilities Assessment** (Due May 15)
   - Strengths/weaknesses evaluation
   - Technical & team skill gaps
   - Competitive positioning analysis

4. **Marketing Plan Development** (Due May 30)
   - Brand positioning for data center market
   - Content strategy & thought leadership
   - Digital + event marketing campaigns
   - LinkedIn & industry publication strategy

5. **Business Development Plan** (Due June 15)
   - Target account list & sales strategy
   - Partnership opportunities
   - BD pipeline targets & sales playbook

6. **Talent Acquisition** (Ongoing)
   - Hire 5-8 new employees (sales, technical, operations)
   - Team training & onboarding
   - Culture building

7. **Progress Tracking & Recalibration** (Monthly)
   - 1st Thursday of month @ 9 AM EST reviews
   - KPI tracking against targets
   - Market feedback & plan adjustments
   - Quarterly board reporting

**KPI Targets (6-month):**
- Market share: +15% in Northeast region
- Revenue growth: +30% YoY
- Pipeline: $5M+ qualified opportunities
- New customers: 12+
- Team: +5-8 new employees
- Brand mentions: 40+ per month
- Win rate improvement: +20%

**Monthly Review Schedule:**
- **1st Thursday of each month @ 9 AM EST**
- Attendees: Tim Ryan (CEO), Sales, Marketing, Operations leads
- Agenda: Progress, KPIs, market feedback, plan adjustments, risks

**Files & Documentation:**
- `PROJECT_WARP_SPEED.md` — Full project plan (this document)
- `.mission-control-state.json` — Project tracking
- `memory/warp-speed-updates.md` — Monthly progress logs
- Marketing calendar & campaign tracking
- BD pipeline + sales metrics

**Critical Success Factors:**
1. Deep market insight (PA/NY data center infrastructure)
2. Team alignment & execution speed
3. Continuous customer feedback loops
4. Resource commitment & hiring
5. Plan flexibility based on real-world results

**Next Actions (Week 1):**
- [ ] Establish market research team
- [ ] Begin TAM analysis
- [ ] Start competitive intelligence work
- [ ] Initiate hiring for critical roles
- [ ] Brief full company on Project Warp Speed

**Risks & Mitigation:**
- Slow hiring → Start recruiting immediately
- Market shifts → Monthly recalibration reviews
- Competitive response → Differentiate on service quality
- Execution delays → Weekly task reviews

---

---

## LinkedIn Writer Skill (✅ LIVE - Tue/Wed/Thu @ 8 AM EST)

**Status:** 🟢 **LIVE & AUTOMATED** - Activated March 28, 2026 @ 9:03 AM EST

**Purpose:** Generate authentic, human-sounding LinkedIn posts 3x/week focused on data center + fiber optics industry insights

**Schedule:** Tue/Wed/Thu @ 8 AM EST (optimal B2B engagement time)  
**Method:** Brave Search API + auto-format selection + quality check  
**Output:** `.linkedin-post-[YYYY-MM-DD].txt` (ready-to-paste copy)

**Skill Features:**
- ✅ Pull trending topics from Brave Search (data center, fiber, 5G, resilience)
- ✅ Auto-select post format (Story, Contrarian, List, Lesson, Behind-the-Scenes)
- ✅ Generate authentic copy (no buzzwords, specific details, real voice)
- ✅ Add 5-8 industry hashtags (#DataCenter #FiberOptics #Telecom #5G etc.)
- ✅ Include engagement hook (question at end drives comments)
- ✅ Quality check (88%+ score before shipping)
- ✅ 2 bundled references: industry keywords + example posts

**Core Files:**
- `skills/linkedin-writer/SKILL.md` — Skill definition + workflow
- `skills/linkedin-writer/references/industry-keywords.md` — Data center + fiber terminology
- `skills/linkedin-writer/references/example-posts.md` — 3 voice examples
- `scripts/generate-linkedin-post.js` — Post generation engine
- `~/Library/LaunchAgents/com.openclaw.linkedin-writer.plist` — macOS scheduler (ACTIVE)
- `.linkedin-post-[date].txt` — Generated posts (ready to copy + paste)
- `.linkedin-writer.log` — Automation logs

**What's Automated:**
- ✅ Topic research (Brave Search API)
- ✅ Format selection (auto-chosen based on topic)
- ✅ Post generation (using your framework)
- ✅ Quality check (88%+ score gate)
- ✅ Scheduling (launchd Tue/Wed/Thu @ 8 AM EST)

**Live Deployment (March 28, 2026):**
- ✅ Skill structure complete (SKILL.md + references)
- ✅ Generation script tested & working (88.9% quality score on first run)
- ✅ launchd job installed & active
- ✅ First generated post ready (5G infrastructure insights)

**Manual Run (Any Time):**
```bash
BRAVE_API_KEY="BSAHJ3Wmk1IbHNqEsACADrcFLfW5eLc" node scripts/generate-linkedin-post.js
```

**Check Status:**
```bash
launchctl list | grep linkedin-writer          # Verify scheduler active
tail -50 .linkedin-writer.log                   # View generation logs
cat .linkedin-post-*.txt                        # View latest post
```

**Workflow:**
1. Launchd triggers at 8 AM EST (Tue/Wed/Thu)
2. Script searches Brave API for trending topics
3. Auto-selects best format for topic
4. Generates post using your voice framework
5. Adds hashtags + engagement hook
6. Quality check (gate: 80%+ score)
7. Saves to `.linkedin-post-[date].txt`
8. You copy + paste to LinkedIn (manual posting, no 2FA issues)
