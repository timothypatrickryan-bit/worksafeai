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

## Hyperscaler Daily Update (✅ LIVE - Daily @ 7:00 AM EST)

**Status:** 🟢 **LIVE & AUTOMATED** - Activated March 25, 2026 @ 2:53 PM EST

**Purpose:** Curated data center construction & fiber deployment news with verified links

**Account:** Tim Ryan (tim.ryan@pro-tel.com)  
**Topics:**
- Data center construction announcements
- Hyperscaler facility expansion news
- Fiber optic deployment announcements
- Undersea cable construction
- Fiber infrastructure investments
- Broadband fiber expansion

**Schedule:** Automated via macOS launchd (Daily @ 7:00 AM EST)  
**Method:** Brave Search API + Link validation + Report generation  
**API Key:** ✅ Configured (BSAHJ3Wmk1IbHNqEsACADrcFLfW5eLc)

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

## LinkedIn Content Posting (✅ LIVE - Tue/Thu/Sat @ 9 AM EST)

**Status:** 🟢 **LIVE & AUTOMATED** - Activated March 24, 2026 @ 7:11 AM EST

**Account:** tim.ryan@pro-tel.com  
**Topics:** Data Center, Telecommunications, Wireless Industry  
**Schedule:** Automated via macOS launchd (Tue/Thu/Sat @ 9 AM EST)  
**Method:** Brave Search API + Post generation + Browser relay posting  
**API Key:** ✅ Configured (BSAHJ3Wmk1IbHNqEsACADrcFLfW5eLc)

**Automation Pipeline:**
1. ✅ **9:00 AM EST trigger** — launchd job (Tue/Thu/Sat)
2. ✅ **Brave Search API** — Fetches real-time trending articles
3. ✅ **Post generation** — Creates data-backed posts with sources
4. ✅ **Alternating topics** — Industry Insight → Trending Topic → Insight
5. ✅ **Browser relay posting** — Posts to LinkedIn via authenticated session
6. ✅ **Logging & tracking** — Records all activity + Brave API usage

**Core Files:**
- `scripts/linkedin-post-now-brave.js` — Post generator with Brave Search
- `scripts/linkedin-auto-post-brave.sh` — Scheduled automation runner
- `scripts/linkedin-browser-post-automation.js` — Browser posting helper
- `~/Library/LaunchAgents/com.openclaw.linkedin-auto-post.plist` — macOS scheduler (ACTIVE)
- `.env` — Brave API key (secure storage)
- `.linkedin-current-post.json` — Latest generated post (with sources)
- `.linkedin-posts.log` — Complete posting history
- `.linkedin-launchd.log` — Automation events (Tue/Thu/Sat)
- `.linkedin-launchd-error.log` — Error tracking

**What's Automated:**
- ✅ Content generation (Tue/Thu/Sat @ 9 AM, real-time research)
- ✅ Scheduling (macOS launchd - LIVE)
- ✅ Topic alternation (Insight → Trending → Insight)
- ✅ Post logging (all activity tracked)
- ✅ Browser posting (auto-posts when relay active)
- ✅ Brave Search integration (up to 2,000 queries/month, using ~13/month)

**Live Deployment (March 24, 2026):**
- ✅ Brave API key configured & tested
- ✅ Post generation verified (tested Insight + Trending)
- ✅ launchd job activated
- ✅ Logging infrastructure in place
- ✅ Browser relay integration ready
- ✅ All documentation updated

**First Live Post:**
🚀 **Tuesday, March 26, 2026 @ 9:00 AM EST**

**Manual Post (Any Time):**
```bash
node scripts/linkedin-post-now-brave.js insight  # Generate insight post
node scripts/linkedin-post-now-brave.js trending # Generate trending post
cat .linkedin-current-post.json | jq '.fullPost' # View generated post
```

**Check Status:**
```bash
launchctl list | grep linkedin          # Verify scheduler active
tail -20 .linkedin-posts.log             # View posting history
tail -20 .linkedin-launchd.log           # View automation events (post-activation)
```

**Brave Search Metrics:**
```bash
grep "Searching Brave" .linkedin-launchd.log | wc -l  # Count API calls
# Safe usage: ~3 calls/week = ~13/month (free tier: 2,000/month)
```

**Full Documentation:**
- `LINKEDIN_BRAVE_DEPLOYMENT.md` — Complete deployment guide
- `LINKEDIN_AUTOMATION_BRAVE_INTEGRATION.md` — Technical reference
- `LINKEDIN_SETUP_FINAL.md` — Original setup guide

---

## QC + Continuous Deployment Workflow (✅ ESTABLISHED - March 26, 2026)

**Standard Process for ALL improvements to WorkSafeAI, Consensus, Mission Control:**

1. **Agent completes work** (feature/fix implemented + tested locally)
2. **Submit for QC** → Create QC briefing with test plan
3. **Velma reviews** (execute QC checklist, verify in staging)
4. **QC Pass** → Commit + Push to GitHub
5. **Auto-Deploy** → GitHub Actions → Vercel (live in production)
6. **Post-Deployment** → Smoke tests + close task

**See:** `QC_DEPLOYMENT_WORKFLOW.md` for complete checklist + metrics

**Responsibility:**
- **Agents:** Code quality, local testing, QC submission
- **Velma:** QC gating, staging verification, sign-off
- **Lucy:** Enforce QC gate before commits/pushes
- **GitHub/Vercel:** Auto-deploy when main branch updated

**Target:** 30 minutes from QC submission to production live

**Benefits:**
- ✅ Zero broken production deployments
- ✅ Continuous improvement delivery (not batched)
- ✅ Full visibility into what's live
- ✅ Measurable quality metrics
- ✅ Fast, safe iteration cycle
